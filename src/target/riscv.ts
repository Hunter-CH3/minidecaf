import { IrInstr, IrVisitor } from "../ir";
import { OtherError } from "../error";

/** 一个整数所占的字节数 */
const WORD_SIZE = 4;

/** 将 IR 的寄存器名映射到 RISC-V 的寄存器名 */
function irReg2rvReg(irReg: string): string {
    return { r0: "t0", r1: "t1" }[irReg];
}

/**
 * 一元运算指令。
 *
 * @param op 运算符
 * @param rd 目标寄存器
 * @param rs 源寄存器
 */
function unaryOp(op: string, rd: string, rs: string): string {
    switch (op) {
        case "-":
            return `neg ${rd}, ${rs}`;
        case "~":
            return `not ${rd}, ${rs}`;
        case "!":
            return `seqz ${rd}, ${rs}`;
        default:
            throw new OtherError(`unknown unary operator '${op}'`);
    }
}

/**
 * 二元运算指令。
 *
 * @param op 运算符
 * @param rd 目标寄存器
 * @param rs1 源寄存器 1，左操作数
 * @param rs2 源寄存器 2，右操作数
 */
function binaryOp(op: string, rd: string, rs1: string, rs2: string): string | string[] {
    switch (op) {
        case "||":
            return [`or ${rd}, ${rs1}, ${rs2}`, `snez ${rd}, ${rd}`];
        case "&&":
            return [`snez ${rs1}, ${rs1}`, `snez ${rs2}, ${rs2}`, `and ${rd}, ${rs1}, ${rs2}`];
        case "==":
            return [`sub ${rd}, ${rs1}, ${rs2}`, `seqz ${rd}, ${rd}`];
        case "!=":
            return [`sub ${rd}, ${rs1}, ${rs2}`, `snez ${rd}, ${rd}`];
        case "<":
            return `slt ${rd}, ${rs1}, ${rs2}`;
        case ">":
            return `slt ${rd}, ${rs2}, ${rs1}`;
        case "<=":
            return [`slt ${rd}, ${rs2}, ${rs1}`, `xori ${rd}, ${rd}, 1`];
        case ">=":
            return [`slt ${rd}, ${rs1}, ${rs2}`, `xori ${rd}, ${rd}, 1`];
        case "+":
            return `add ${rd}, ${rs1}, ${rs2}`;
        case "-":
            return `sub ${rd}, ${rs1}, ${rs2}`;
        case "*":
            return `mul ${rd}, ${rs1}, ${rs2}`;
        case "/":
            return `div ${rd}, ${rs1}, ${rs2}`;
        case "%":
            return `rem ${rd}, ${rs1}, ${rs2}`;
        default:
            throw new OtherError(`unknown binary operator '${op}'`);
    }
}

/**
 * 从内存地址 `base + offset` 读出数据，存到寄存器 `rd`。
 *
 * @param rd 目标寄存器
 * @param base 基址寄存器
 * @param offset 偏移量，默认为 0
 */
function load(rd: string, base: string, offset: number = 0): string {
    return `lw ${rd}, ${offset}(${base})`;
}

/**
 * 将寄存器 `rs` 中的数据存到内存地址 `base + offset`。
 *
 * @param rs 源寄存器
 * @param base 基址寄存器
 * @param offset 偏移量，默认为 0
 */
function store(rs: string, base: string, offset: number = 0): string {
    return `sw ${rs}, ${offset}(${base})`;
}

/** 调整栈指针，即 `sp += offset` */
function adjustStack(offset: number): string {
    if (offset) {
        return `addi sp, sp, ${offset}`;
    } else {
        return "";
    }
}

/** IR 到 RV32 的代码生成器 */
export class Riscv32CodeGen extends IrVisitor<string> {
    private asm: string = "";

    /** 生成一个标签 */
    private emitLabel(label: string) {
        this.asm += `${label}:\n`;
    }
    /** 生成一个指示符，如 .globl, .data, .word 等 */
    private emitDirective(directive: string) {
        this.asm += `${directive}\n`;
    }
    /** 生成一条或多条机器指令 */
    private emitInstr(instr: string | string[]) {
        if (instr.length > 0) {
            if (instr instanceof Array) {
                this.asm += `    ${instr.join("\n    ")}\n`;
            } else {
                this.asm += `    ${instr}\n`;
            }
        }
    }

    visitImmediate(instr: IrInstr) {
        this.emitInstr(`li t0, ${instr.op}`);
    }

    visitUnary(instr: IrInstr) {
        this.emitInstr(unaryOp(instr.op, "t0", "t0"));
    }

    visitBinary(instr: IrInstr) {
        this.emitInstr(binaryOp(instr.op, "t0", "t1", "t0"));
    }

    visitPush(instr: IrInstr) {
        this.emitInstr([adjustStack(-WORD_SIZE), store(irReg2rvReg(instr.op), "sp")]);
    }

    visitPop(instr: IrInstr) {
        this.emitInstr([load(irReg2rvReg(instr.op), "sp"), adjustStack(WORD_SIZE)]);
    }

    visitReturn(_instr: IrInstr) {
        this.emitInstr("mv a0, t0");
        this.emitInstr("ret");
    }

    visitAll(): string {
        this.emitDirective(".globl main");
        this.emitLabel("main");
        for (let i of this.ir.instrs) {
            this.visitInstr(i);
        }
        return this.asm;
    }
}
