package com.platform.judge.generator;

import org.springframework.stereotype.Component;

/**
 * JavaCodeGenerator
 *
 * Responsibility: Generate a complete, self-contained, runnable Java source
 * file by injecting user-supplied solution code and a dynamically constructed
 * function-call block into a fixed scaffold template.
 *
 * This class has NO knowledge of specific problems, test cases, or execution
 * mechanics — it is purely a code-generation utility.
 */
@Component
public class JavaCodeGenerator {

    /**
     * Scaffold template.
     *
     * Placeholders (replaced at generation time):
     *   {{USER_CODE}}          — the user's Solution method(s)
     *   {{FUNCTION_CALL_BLOCK}} — the statements that call Solution methods
     *                            and print results
     */
    private static final String TEMPLATE = """
            import java.util.*;
            import java.io.*;
            import java.math.*;
            
            class Solution {
            {{USER_CODE}}
            }
            
            public class Main {
                public static void main(String[] args) {
            
                    Solution sol = new Solution();
            
            {{FUNCTION_CALL_BLOCK}}
            
                }
            }
            """;

    // Placeholder tokens — kept as constants to avoid magic strings scattered
    // throughout the class.
    private static final String USER_CODE_PLACEHOLDER      = "{{USER_CODE}}";
    private static final String FUNCTION_CALL_PLACEHOLDER = "{{FUNCTION_CALL_BLOCK}}";

    /**
     * Generate a complete Java source file.
     *
     * @param userCode          The body of the Solution class (one or more
     *                          method definitions). Must not include the class
     *                          declaration itself — just the method(s).
     * @param functionCallBlock Statements placed inside {@code main()}.
     *                          Typically: variable declarations, sol.methodName(...)
     *                          calls, and {@code System.out.println(...)} output
     *                          statements.
     * @return A fully-formed Java source string ready to be written to Main.java
     *         and compiled.
     */
    public String generate(String userCode, String functionCallBlock) {
        if (userCode == null) {
            throw new IllegalArgumentException("userCode must not be null");
        }
        if (functionCallBlock == null) {
            throw new IllegalArgumentException("functionCallBlock must not be null");
        }

        // Indent user code by 4 spaces so it sits cleanly inside Solution {}
        String indentedUserCode      = indentBlock(userCode, "    ");
        // Indent the call block by 8 spaces (inside main's body)
        String indentedCallBlock     = indentBlock(functionCallBlock, "        ");

        return TEMPLATE
                .replace(USER_CODE_PLACEHOLDER, indentedUserCode)
                .replace(FUNCTION_CALL_PLACEHOLDER, indentedCallBlock);
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    /**
     * Prefix every non-empty line in {@code block} with {@code indent}.
     * Empty lines are preserved as-is so blank lines in user code stay clean.
     */
    private String indentBlock(String block, String indent) {
        if (block.isBlank()) {
            return "";
        }
        String[] lines = block.split("\n", -1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            if (!line.isBlank()) {
                sb.append(indent).append(line);
            } else {
                sb.append(line); // preserve blank lines without adding trailing spaces
            }
            if (i < lines.length - 1) {
                sb.append('\n');
            }
        }
        return sb.toString();
    }
}
