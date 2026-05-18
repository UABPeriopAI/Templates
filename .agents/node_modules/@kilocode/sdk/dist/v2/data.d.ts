import type { Part, UserMessage } from "./client.js";
export declare const message: {
    user(input: Omit<UserMessage, "role" | "time" | "id"> & {
        parts: Omit<Part, "id" | "sessionID" | "messageID">[];
    }): {
        info: UserMessage;
        parts: Part[];
    };
};
