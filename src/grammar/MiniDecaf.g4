grammar MiniDecaf;

import Lexer;

program
    : func EOF
    ;

func
    : Int Main '(' ')' '{' stmt '}'
    ;

stmt
    : Return expr ';'
    ;

expr
    : addExpr
    ;

addExpr
    : mulExpr
    | addExpr ('+' | '-') mulExpr
    ;

mulExpr
    : factor
    | mulExpr ('*' | '/' | '%') factor
    ;

factor
    : Integer           # IntExpr
    | '(' expr ')'      # NestedExpr
    | unaryOp factor    # UnaryExpr
    ;

unaryOp
    : '-' | '~' | '!'
    ;
