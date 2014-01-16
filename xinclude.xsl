<xsl:stylesheet 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xi="http://www.w3.org/2001/XInclude"
	version="1.0"
>
<xsl:output method="xml"/>
<!-- sylesheet to implement xinclude -->
<xsl:template match="node()|@*">
  <xsl:copy>
     <xsl:apply-templates  select="node()|@*"/>
  </xsl:copy>
</xsl:template>
<xsl:template match="xi:include">
	<!-- problem here: uses the stylesheet path as reference -->
	<xsl:copy-of select="document(concat('',@href))"/>
</xsl:template>
</xsl:stylesheet>
