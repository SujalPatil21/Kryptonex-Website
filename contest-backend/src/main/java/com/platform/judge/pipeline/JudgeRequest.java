package com.platform.judge.pipeline;

import java.util.List;

/**
 * JudgeRequest
 *
 * Immutable value object that carries all the information the judge pipeline
 * needs to evaluate a single test-case submission.
 *
 * Responsibilities: data transport only — no behaviour.
 *
 * @param userCode       The raw method body code submitted by the user.
 *                       Must NOT include a class wrapper; the generator adds it.
 * @param methodName     The name of the solution method to call (e.g. "twoSum").
 * @param paramTypes     Ordered list of parameter type strings
 *                       (e.g. ["int[]", "int"]).  Matched 1-to-1 with paramValues.
 * @param paramValues    Ordered list of raw string values for each parameter
 *                       (e.g. ["[2,7,11,15]", "9"]).
 * @param returnType     The Java return type of the solution method
 *                       (e.g. "int[]"). Used to build the print statement.
 * @param expectedOutput The expected output string to compare against after
 *                       execution.
 */
public record JudgeRequest(
        String       userCode,
        String       methodName,
        List<String> paramTypes,
        List<String> paramValues,
        String       returnType,
        String       expectedOutput
) {
    public JudgeRequest {
        if (userCode == null || userCode.isBlank())
            throw new IllegalArgumentException("userCode must not be blank");
        if (methodName == null || methodName.isBlank())
            throw new IllegalArgumentException("methodName must not be blank");
        if (paramTypes == null || paramValues == null)
            throw new IllegalArgumentException("paramTypes and paramValues must not be null");
        if (paramTypes.size() != paramValues.size())
            throw new IllegalArgumentException(
                    "paramTypes and paramValues must have the same size");
    }
}
