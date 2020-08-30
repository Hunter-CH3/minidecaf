import { IrInstr, IrVisitor } from "../ir";
import { OtherError } from "../error";

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
    /** 生成一条机器指令 */
    private emitInstr(instr: string) {
        this.asm += `    ${instr}\n`;
    }

    visitImmediate(instr: IrInstr) {
        this.emitInstr(`li t0, ${instr.op}`);
    }

    visitUnary(instr: IrInstr) {
        switch (instr.op) {
            case "-":
                this.emitInstr(`neg t0, t0`);
                break;
            case "~":
                this.emitInstr(`not t0, t0`);
                break;
            case "!":
                this.emitInstr(`seqz t0, t0`);
                break;
            default:
                throw new OtherError(`unknown unary operator '${instr.op}'`);
        }
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
