/**
 * Shell completion descriptors and script generation for the unstable CLI API.
 *
 * @since 4.0.0
 */
import * as Bash from "./internal/completions/bash.js";
import * as Fish from "./internal/completions/fish.js";
import * as Zsh from "./internal/completions/zsh.js";
/**
 * Generates a shell completion script for a command descriptor.
 *
 * @since 4.0.0
 * @category constructors
 */
export const generate = (executableName, shell, descriptor) => {
  switch (shell) {
    case "bash":
      return Bash.generate(executableName, descriptor);
    case "zsh":
      return Zsh.generate(executableName, descriptor);
    case "fish":
      return Fish.generate(executableName, descriptor);
  }
};
//# sourceMappingURL=Completions.js.map