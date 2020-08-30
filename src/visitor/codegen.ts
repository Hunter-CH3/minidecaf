import { AbstractParseTreeVisitor } from "antlr4ts/tree";
import { MiniDecafVisitor } from "../gen/MiniDecafVisitor";
import MiniDecafParser = require("../gen/MiniDecafParser");

/** 语法树到 RV32 汇编码的生成器 */
export class Riscv32CodeGen extends AbstractParseTreeVisitor<string>
    implements MiniDecafVisitor<string> {
    defaultResult(): string {
        return "";
    }

    visitProgram(ctx: MiniDecafParser.ProgramContext): string {
        return ctx.func().accept(this);
    }

    visitFunc(ctx: MiniDecafParser.FuncContext): string {
        let asm = ".globl main\nmain:\n";
        asm += ctx.stmt().accept(this);
        return asm;
    }

    visitStmt(ctx: MiniDecafParser.StmtContext): string {
        let asm = ctx.expr().accept(this);
        asm += "    ret\n";
        return asm;
    }

    visitExpr(ctx: MiniDecafParser.ExprContext): string {
        let int = parseInt(ctx.Integer().text);
        return `    li a0, ${int}\n`;
    }
}
