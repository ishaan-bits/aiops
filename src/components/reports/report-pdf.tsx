"use client";

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import type { ReportResponse } from "@/services/reports";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#6b7280", marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", marginTop: 20, marginBottom: 10, color: "#4f46e5" },
  summary: { fontSize: 10, lineHeight: 1.6, color: "#374151", marginBottom: 16 },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  kpiCard: { width: "30%", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 },
  kpiLabel: { fontSize: 9, color: "#6b7280", marginBottom: 4 },
  kpiValue: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  kpiChange: { fontSize: 8, color: "#6b7280", marginTop: 4 },
  tableTitle: { fontSize: 12, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f3f4f6", padding: 6, borderBottom: "1px solid #e5e7eb" },
  tableHeaderText: { fontSize: 9, fontWeight: "bold", color: "#374151" },
  tableRow: { flexDirection: "row", padding: 6, borderBottom: "1px solid #f3f4f6" },
  tableCell: { fontSize: 9, color: "#1f2937" },
});

function ReportPDFDocument({ report }: { report: ReportResponse }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.subtitle}>
          Generated: {new Date(report.generated_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </Text>

        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.summary}>{report.summary}</Text>

        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.kpiRow}>
          {report.kpis.map((kpi, i) => (
            <View key={i} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              {kpi.change && <Text style={styles.kpiChange}>{kpi.change}</Text>}
            </View>
          ))}
        </View>

        {report.tables.map((table, ti) => (
          <View key={ti}>
            <Text style={styles.tableTitle}>{table.title}</Text>
            <View style={styles.tableHeader}>
              {table.columns.map((col) => (
                <Text key={col.key} style={[styles.tableHeaderText, { flex: 1 }]}>
                  {col.label}
                </Text>
              ))}
            </View>
            {table.rows.slice(0, 20).map((row, ri) => (
              <View key={ri} style={styles.tableRow}>
                {table.columns.map((col) => (
                  <Text key={col.key} style={[styles.tableCell, { flex: 1 }]}>
                    {String(row.values[col.key] ?? "—")}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function ReportPDFExport({ report }: { report: ReportResponse }) {
  return (
    <PDFDownloadLink
      document={<ReportPDFDocument report={report} />}
      fileName={`${report.template}-report-${new Date().toISOString().split("T")[0]}.pdf`}
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-600 hover:shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export PDF
        </button>
      )}
    </PDFDownloadLink>
  );
}
