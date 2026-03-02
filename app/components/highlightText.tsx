import React from "react";
import { tokenize } from "@/lib/search-engine/tokenize";

/** Regex to escape special characters for use in a Regular Expression */
const REGEX_ESCAPE_PATTERN = /[.*+?^${}()|[\]\\]/g;

export function highlightText(text: string, query: string): React.ReactNode {
    if (!query?.trim() || !text) return text;

    const tokens = new Set(tokenize(query));
    if (tokens.size === 0) return text;

    // Create a pattern that matches any of the tokens, escaping special characters
    const escapedTokens = Array.from(tokens, (token) => token.replace(REGEX_ESCAPE_PATTERN, "\\$&"));
    const highlightRegex = new RegExp(`(${escapedTokens.join("|")})`, "gi");

    return text.split(highlightRegex).map((part, index) => {
        const isMatch = tokens.has(part.toLowerCase());

        return isMatch ? (
            <mark 
                key={index} 
                className="bg-amber-200/80 dark:bg-amber-500/30 text-inherit rounded-sm px-0.5"
            >
                {part}
            </mark>
        ) : (
            part
        );
    });
}
