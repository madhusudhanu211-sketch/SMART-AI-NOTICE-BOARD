import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

const DOCUMENTS_DATA = [
  { id: '1', title: 'Computer Science Syllabus 2026', size: '2.4 MB', type: 'PDF' },
  { id: '2', title: 'Fee Payment Receipt - Semester 6', size: '450 KB', type: 'PDF' },
  { id: '3', title: 'Bonafide Certificate Request', size: '180 KB', type: 'PDF' },
  { id: '4', title: 'Academic Regulations & Conduct Policy', size: '1.8 MB', type: 'PDF' },
];

export default function DocumentsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>📄 Academic Documents</Text>
          <Text style={styles.subtitle}>Syllabi, fee receipts, and official certificates</Text>
        </View>

        {DOCUMENTS_DATA.map((doc) => (
          <View key={doc.id} style={styles.card}>
            <View style={styles.docInfo}>
              <Text style={styles.docIcon}>📕</Text>
              <View>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docMeta}>
                  {doc.type} • {doc.size}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadBtn}>
              <Text style={styles.downloadBtnText}>Download</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  docIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  docTitle: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  docMeta: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  downloadBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
