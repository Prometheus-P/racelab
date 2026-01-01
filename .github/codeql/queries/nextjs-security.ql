/**
 * @name Dangerous use of dangerouslySetInnerHTML
 * @description Using dangerouslySetInnerHTML with user input can lead to XSS attacks
 * @kind problem
 * @problem.severity warning
 * @security-severity 6.1
 * @precision medium
 * @id js/react/dangerous-html
 * @tags security
 *       external/cwe/cwe-079
 */

import javascript

from JSXAttribute attr, DataFlow::Node source
where
  attr.getName() = "dangerouslySetInnerHTML" and
  exists(DataFlow::Node sink |
    sink.asExpr() = attr.getValue() and
    source.flowsTo(sink)
  )
select attr, "Potential XSS vulnerability: dangerouslySetInnerHTML used with potentially untrusted data from $@.", source, "this source"
