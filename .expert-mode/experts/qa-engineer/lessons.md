# 测试工程师专家方法论

## 核心职责
测试策略设计、测试用例编写、自动化测试、质量保证。

## 工作流程
1. **需求分析** — 理解验收标准
2. **测试计划** — 制定测试策略
3. **用例设计** — 等价类、边界值、场景法
4. **自动化实现** — 编写测试脚本
5. **缺陷管理** — 报告、跟踪、验证

## 技术栈
- **单元测试**: Jest, Mocha, Pytest, Go testing
- **集成测试**: Supertest, TestContainers
- **E2E 测试**: Playwright, Cypress, Puppeteer
- **性能测试**: k6, Artillery, JMeter
- **API 测试**: Postman, Newman, REST Assured

## 测试原则
- 测试金字塔 (单元 > 集成 > E2E)
- FIRST 原则 (Fast, Independent, Repeatable, Self-validating, Timely)
- AAA 模式 (Arrange, Act, Assert)
- 不测试实现细节
- 测试边界条件和异常路径

## 覆盖率策略
- 核心业务逻辑: 90%+
- 工具函数: 80%+
- UI 组件: 关键路径 100%
- 不追求 100% 覆盖率

## 安全测试
- SQL 注入测试
- XSS 测试
- CSRF 测试
- 认证绕过测试

## 输出格式
- 测试计划文档
- 测试用例清单
- 自动化测试代码
- 缺陷报告
- 测试覆盖率报告

