// DEMO ONLY: Define-XML metadata is generated client-side to describe the
// existing SDTM DM and AE CSV exports; no CDISC service is connected.
//
// Column names are taken from:
//   sdtmDm.js  → STUDYID, DOMAIN, USUBJID, SUBJID, SITEID, AGE, SEX, ARM
//   sdtmAe.js  → STUDYID, DOMAIN, USUBJID, AETERM, AESER, AESTDTC

/** Exact DM columns from sdtmDm.js rowsToCsv COLUMNS */
const DM_COLUMNS = [
  { name: "STUDYID", dataType: "text", label: "Study Identifier" },
  { name: "DOMAIN", dataType: "text", label: "Domain Abbreviation" },
  { name: "USUBJID", dataType: "text", label: "Unique Subject Identifier" },
  { name: "SUBJID", dataType: "text", label: "Subject Identifier for the Study" },
  { name: "SITEID", dataType: "text", label: "Study Site Identifier" },
  { name: "AGE", dataType: "text", label: "Age" },
  { name: "SEX", dataType: "text", label: "Sex" },
  { name: "ARM", dataType: "text", label: "Description of Planned Arm" },
];

/** Exact AE columns from sdtmAe.js rowsToCsv COLUMNS */
const AE_COLUMNS = [
  { name: "STUDYID", dataType: "text", label: "Study Identifier" },
  { name: "DOMAIN", dataType: "text", label: "Domain Abbreviation" },
  { name: "USUBJID", dataType: "text", label: "Unique Subject Identifier" },
  { name: "AETERM", dataType: "text", label: "Reported Term for the Adverse Event" },
  { name: "AESER", dataType: "text", label: "Serious Event" },
  { name: "AESTDTC", dataType: "date", label: "Start Date/Time of Adverse Event" },
];

/**
 * Escapes XML-sensitive characters in text/attribute values.
 * @param {unknown} value
 * @returns {string}
 */
function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Builds ItemRef elements for an ItemGroupDef.
 * @param {string} domain
 * @param {Array<{name: string}>} columns
 * @returns {string}
 */
function buildItemRefs(domain, columns) {
  return columns
    .map(
      (col, index) =>
        `        <ItemRef ItemOID="IT.${escapeXml(domain)}.${escapeXml(col.name)}" OrderNumber="${index + 1}" Mandatory="Yes"/>`,
    )
    .join("\n");
}

/**
 * Builds ItemDef elements for a domain's columns.
 * @param {string} domain
 * @param {Array<{name: string, dataType: string, label: string}>} columns
 * @returns {string}
 */
function buildItemDefs(domain, columns) {
  return columns
    .map(
      (col) => `      <ItemDef OID="IT.${escapeXml(domain)}.${escapeXml(col.name)}" Name="${escapeXml(col.name)}" DataType="${escapeXml(col.dataType)}" Length="200">
        <Description>
          <TranslatedText xml:lang="en">${escapeXml(col.label)}</TranslatedText>
        </Description>
        <def:Origin Type="Collected"/>
        <def:CommentOID>COM.${escapeXml(domain)}.${escapeXml(col.name)}</def:CommentOID>
      </ItemDef>
      <def:CommentDef OID="COM.${escapeXml(domain)}.${escapeXml(col.name)}">
        <Description>
          <TranslatedText xml:lang="en">Column ${escapeXml(col.name)} in SDTM ${escapeXml(domain)} domain export from AIIA-CTMS.</TranslatedText>
        </Description>
      </def:CommentDef>`,
    )
    .join("\n");
}

/**
 * Builds a Define-XML 2.0–style metadata document for DM and AE exports.
 * Static structure describing export columns (not a data dump).
 * @returns {string}
 */
export function buildDefineXml() {
  const creationDateTime = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3"
     xmlns:def="http://www.cdisc.org/ns/def/v2.0"
     xmlns:xml="http://www.w3.org/XML/1998/namespace"
     FileType="Snapshot"
     Granularity="Metadata"
     FileOID="AIIA.Define-XML"
     CreationDateTime="${escapeXml(creationDateTime)}"
     ODMVersion="1.3.2"
     SourceSystem="AIIA-CTMS"
     SourceSystemVersion="1.0">
  <Study OID="STUDY.AIIA">
    <GlobalVariables>
      <StudyName>AIIA-CTMS</StudyName>
      <StudyDescription>Define-XML metadata describing AIIA-CTMS SDTM DM and AE CSV exports</StudyDescription>
      <ProtocolName>AIIA-CTMS</ProtocolName>
    </GlobalVariables>
    <MetaDataVersion OID="MDV.AIIA.SDTM.1" Name="AIIA SDTM Define-XML" def:DefineVersion="2.0.0">
      <ItemGroupDef OID="IG.DM" Name="DM" Domain="DM" SASDatasetName="DM" Purpose="Tabulation" def:Structure="One record per subject" def:Class="SPECIAL PURPOSE" def:ArchiveLocationID="Location.DM">
        <Description>
          <TranslatedText xml:lang="en">Demographics</TranslatedText>
        </Description>
${buildItemRefs("DM", DM_COLUMNS)}
        <def:leaf ID="Location.DM" xlink:href="AIIA_DM.csv" xmlns:xlink="http://www.w3.org/1999/xlink">
          <def:title>SDTM DM dataset CSV</def:title>
        </def:leaf>
      </ItemGroupDef>
      <ItemGroupDef OID="IG.AE" Name="AE" Domain="AE" SASDatasetName="AE" Purpose="Tabulation" def:Structure="One record per adverse event" def:Class="EVENTS" def:ArchiveLocationID="Location.AE">
        <Description>
          <TranslatedText xml:lang="en">Adverse Events</TranslatedText>
        </Description>
${buildItemRefs("AE", AE_COLUMNS)}
        <def:leaf ID="Location.AE" xlink:href="AIIA_AE.csv" xmlns:xlink="http://www.w3.org/1999/xlink">
          <def:title>SDTM AE dataset CSV</def:title>
        </def:leaf>
      </ItemGroupDef>
${buildItemDefs("DM", DM_COLUMNS)}
${buildItemDefs("AE", AE_COLUMNS)}
    </MetaDataVersion>
  </Study>
</ODM>
`;
}

/**
 * Downloads AIIA_Define-XML.xml describing DM and AE export columns.
 */
export function downloadDefineXml() {
  const xml = buildDefineXml();
  const blob = new Blob([xml], { type: "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "AIIA_Define-XML.xml";
  a.click();
  URL.revokeObjectURL(url);
}
