<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:ns0="http://xmlns.oracle.com/pcbpel/adapter/db/top/dbBoard"
  exclude-result-prefixes="ns0">

  <!--
    Convierte un nodo ns0:Board (CRUD) en un ns0:BoardCollection con un solo ns0:Board.
    Esto permite que el adapter dbBoard (que espera BoardCollection) reciba la estructura correcta.
  -->

  <xsl:template match="/">
    <xsl:apply-templates select="ns0:Board"/>
  </xsl:template>

  <xsl:template match="ns0:Board">
    <ns0:BoardCollection>
      <ns0:Board>
        <xsl:copy-of select="ns0:id"/>
        <xsl:if test="ns0:name">
          <xsl:copy-of select="ns0:name"/>
        </xsl:if>
      </ns0:Board>
    </ns0:BoardCollection>
  </xsl:template>
</xsl:stylesheet>

