import { AbstractParseTreeVisitor } from "antlr4ts/tree";
import { MiniDecafVisitor } from "../gen/MiniDecafVisitor";
import MiniDecafParser = require("../gen/MiniDecafParser");
import { Ir } from "../ir";

/** 语法树到 IR 的生成器 */
export class IrGen extends AbstractParseTreeVisitor<void> implements MiniDecafVisitor<void> {
    ir: Ir = new Ir();

    defaultResult() {}

    visitProgram(ctx: MiniDecafParser.ProgramContext) {
        ctx.func().accept(this);
    }

    visitFunc(ctx: MiniDecafParser.FuncContext) {
        ctx.stmt().accept(this);
    }

    visitStmt(ctx: MiniDecafParser.StmtContext) {
        ctx.expr().accept(this);
        this.ir.emitReturn();
    }

    visitIntExpr(ctx: MiniDecafParser.IntExprContext) {
        let int = parseInt(ctx.Integer().text);
        this.ir.emitImmediate(int);
    }

    visitUnaryExpr(ctx: MiniDecafParser.UnaryExprContext) {
        ctx.expr().accept(this);
        this.ir.emitUnary(ctx.getChild(0).text);
    }
}
