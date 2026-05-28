---
name: "SOA Test Generator"
description: "Generates test cases for SOA composites by creating or modifying XML test files and updating fileList.xml."
---

# SOA Test Generator

This skill defines the workflow for creating new SOA tests, updating existing ones, and troubleshooting failures.

## Context
In SOA development, the initial creation of the **test suite** (the base folder, e.g., `testsuites/Create_Card_Tests/tests/`) must be done manually by the user using Oracle JDeveloper. When the user creates this suite, JDeveloper usually generates a "default" base XML test file inside it.
This default file is critical because it contains the exact structure of how data is sent and received for that specific composite.

## Workflow

1. **Acknowledge Prerequisites:** The user must have already created the test suite folder in JDeveloper.
2. **Phase 1 - Modifying the Default Test:** Typically, the user will first ask you to modify the JDeveloper-generated default test to ensure it is correct (e.g., fixing data values, adding the correct intent). Sometimes this default test will already be structurally correct out of the box.
3. **Phase 2 - Creating New Tests:** Once the base test exists (or has been corrected), the user may ask you to create new test files from scratch.
   - You must create a new `[TestName].xml` file in the suite's `tests` folder.
   - You must add its entry (`<entry key="[TestName].xml"/>`) to the `fileList.xml` file located in the same folder.
4. **Phase 3 - Troubleshooting (Very Common):** It is extremely common for tests to fail during execution in JDeveloper. When a test fails, the user will paste the error logs or fault codes into the chat. You must analyze the SOAP/XML error, correlate it with the payload in the test, and fix the `.xml` file accordingly.
5. **Determine Intent (CRITICAL RULE):** The user MUST provide the intent of the test (what the test is trying to accomplish, e.g., "test successful update"). If the user DOES NOT provide the intent, ask the user for it and **END YOUR RESPONSE IMMEDIATELY**.
6. **Analyze the Default XML Template (CRITICAL):** Before creating any new test, you MUST analyze the default XML test file (or other already corrected tests) in the suite. You may not know the exact schema for the composite; therefore, you MUST use the default XML as your strict template to understand exactly how data is requested and sent.

## Data Generation Rules
- **Preserve Attributes:** Analyze and use the exact same attribute/node names from the DB schema provided in the default XML templates. **Do not add, remove, or rename attributes.**
- **Modify Data Values:** You must change the actual data values to match the intent of the test.
- **Use High IDs:** When generating mock data for primary keys, always use excessively high IDs (e.g., `9999`) to avoid overlap or collision errors. 
- **Foreign Keys:** For foreign keys (e.g., `boardId`, `userId`), try to use reasonable or existing IDs if the context implies them, rather than high IDs, so relations don't fail immediately (unless the test intent is to fail a foreign key constraint).

## XML Structure Example (Standard Table Update)

Here is an example of a complete SOA test XML file. **Note that this specific example represents a standard update operation for a table in SOA** (e.g., updating a card in the database):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<compositeTest compositeDN="CRUD_CARD" xmlns="http://xmlns.oracle.com/sca/2006/test">
  <about></about>
  <initiate serviceName="updatecard_client_ep" operation="process" isAsync="false" delay="PT0S">
    <message>
      <part partName="payload">
        <content>
          <ns2:CardCollection xmlns:ns2="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbCard">
            <ns2:Card>
              <ns2:id>1</ns2:id>
              <ns2:boardId>5</ns2:boardId>
              <ns2:priority>2</ns2:priority>
              <ns2:statusId>2</ns2:statusId>
              <ns2:description>Descripción modificada</ns2:description>
              <ns2:title>Tarjeta Actualizada</ns2:title>
            </ns2:Card>
          </ns2:CardCollection>
        </content>
      </part>
    </message>
  </initiate>
  <wireActions wireSource="updatecard_client_ep" operation="process">
    <assert comparisonMethod="xml-similar">
      <description/>
      <expected>
        <location key="output"/>
        <test:message xmlns:test="http://xmlns.oracle.com/sca/2006/test">
          <test:part partName="payload">
            <test:content>
              <ns2:CardCollection xmlns:ns2="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbCard">
                <ns2:Card>
                  <ns2:id>1</ns2:id>
                  <ns2:boardId>5</ns2:boardId>
                  <ns2:priority>2</ns2:priority>
                  <ns2:statusId>2</ns2:statusId>
                  <ns2:description>Descripción modificada</ns2:description>
                  <ns2:title>Tarjeta Actualizada</ns2:title>
                </ns2:Card>
              </ns2:CardCollection>
            </test:content>
          </test:part>
        </test:message>
      </expected>
    </assert>
  </wireActions>
</compositeTest>
```

## Rules
- **NEVER** attempt to create the `testsuites/` folder structure from scratch. The base test suite MUST be created by the user first.
- When creating a new test file, you **MUST** also append an `<entry key="[TestName].xml"/>` to the `fileList.xml` file inside that test suite's `tests` folder.
- Always rely on the auto-generated XML file within the suite to learn the schema. Do not guess or hallucinate the XML structure.
- Ensure namespaces match the specific composite being tested (e.g., `xmlns:ns2` should match the actual target database adapter or WSDL).
