/** @module pressEnterToContinue */

import PromptSync from "prompt-sync";

const prompt = PromptSync({
    sigint: true,
});

/**
 * Wait for enter.
 * @param {string} message
 */
export default function (message = "Press enter to continue...") {
    prompt(message);
}
