import { AbstractParseTreeVisitor } from "antlr4ts/tree";
import { MiniDecafVisitor } from "../gen/MiniDecafVisitor";
import MiniDecafParser = require("../gen/MiniDecafParser");

/** 解释执行器，直接在语法树上执行 */
export class Executor extends AbstractParseTreeVisitor<number> implements MiniDecafVisitor<number> {
    defaultResult(): number {
        return 0;
    }

    visitProgram(ctx: MiniDecafParser.ProgramContext): number {
        return ctx.func().accept(this);
    }

    visitFunc(ctx: MiniDecafParser.FuncContext): number {
        return ctx.stmt().accept(this);
    }

    visitStmt(ctx: MiniDecafParser.StmtContext): number {
        return ctx.expr().accept(this);
    }

    visitExpr(ctx: MiniDecafParser.ExprContext): number {
        let int = parseInt(ctx.Integer().text);
        return int;
    }
}
