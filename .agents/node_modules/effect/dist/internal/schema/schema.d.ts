import type { Issue } from "../../SchemaIssue.ts";
export declare class SchemaError {
    readonly [SchemaErrorTypeId] = "~effect/Schema/SchemaError";
    readonly _tag = "SchemaError";
    readonly name: string;
    readonly issue: Issue;
    constructor(issue: Issue);
    get message(): string;
    toString(): string;
}
//# sourceMappingURL=schema.d.ts.map