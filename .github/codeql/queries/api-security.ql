/**
 * @name Hardcoded API keys or secrets
 * @description Hardcoded credentials in source code can be exploited
 * @kind problem
 * @problem.severity error
 * @security-severity 8.0
 * @precision high
 * @id js/hardcoded-credentials
 * @tags security
 *       external/cwe/cwe-798
 */

import javascript

from StringLiteral str
where
  (
    str.getValue().regexpMatch("(?i).*(api[_-]?key|secret|password|token|auth).*=.*[a-zA-Z0-9]{16,}.*") or
    str.getValue().regexpMatch("(?i)^(sk|pk)[-_]live[-_][a-zA-Z0-9]{20,}$") or
    str.getValue().regexpMatch("^ghp_[a-zA-Z0-9]{36}$") or
    str.getValue().regexpMatch("^npm_[a-zA-Z0-9]{36}$")
  ) and
  not str.getFile().getRelativePath().matches("%test%") and
  not str.getFile().getRelativePath().matches("%mock%") and
  not str.getFile().getRelativePath().matches("%.example%")
select str, "Potential hardcoded credential or API key detected."
