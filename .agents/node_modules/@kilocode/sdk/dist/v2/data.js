export const message = {
    user(input) {
        const { parts: _parts, ...rest } = input;
        const info = {
            ...rest,
            id: "asdasd",
            time: {
                created: Date.now(),
            },
            role: "user",
        };
        return {
            info,
            parts: input.parts.map((part) => ({
                ...part,
                id: "asdasd",
                messageID: info.id,
                sessionID: info.sessionID,
            })),
        };
    },
};
