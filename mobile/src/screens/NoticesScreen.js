import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
} from 'react-native';

const INITIAL_NOTICES = [
  {
    id: '1',
    title: 'End Semester Examination Schedule & Guidelines 2026',
    category: 'Academic',
    priority: 'HIGH',
    author: 'Controller of Examinations',
    date: '2026-08-10',
    content: 'The end semester theory and practical examinations will commence from September 1st. Detailed date sheet is published on the portal. Attendance eligibility threshold is 75%.',
  },
  {
    id: '2',
    title: 'Google Software Engineering Placement Drive 2026',
    category: 'Placements',
    priority: 'URGENT',
    author: 'Placement Cell',
    date: '2026-08-09',
    content: 'Google is conducting an on-campus placement drive for Final Year CS/IT/ECE students. Minimum CGPA required: 8.0. Register before August 15th.',
  },
  {
    id: '3',
    title: 'National Level AI & Robotics Hackathon 2026',
    category: 'Events',
    priority: 'MEDIUM',
    author: 'Robotics Club',
    date: '2026-08-08',
    content: 'Register your teams for the 36-hour hackathon on Autonomous Robotics & Generative AI. Exciting cash prizes worth $5,000 up for grabs.',
  },
  {
    id: '4',
    title: 'Library Extended Hours During Examination Week',
    category: 'General',
    priority: 'LOW',
    author: 'Central Library',
    date: '2026-08-07',
    content: 'Central library will remain open 24x7 from August 20th onwards with silent study rooms and Wi-Fi access enabled.',
  },
];

const CATEGORIES = ['All', 'Academic', 'Placements', 'Events', 'General'];

export default function NoticesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);

  const filteredNotices = INITIAL_NOTICES.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search notices, exams, placement drives..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === item && styles.categoryChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Notices List */}
      <FlatList
        data={filteredNotices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noticeCard}
            onPress={() => setSelectedNotice(item)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.categoryTag}>{item.category}</Text>
              <Text
                style={[
                  styles.priorityTag,
                  item.priority === 'URGENT' || item.priority === 'HIGH'
                    ? styles.urgentTag
                    : styles.normalTag,
                ]}
              >
                {item.priority}
              </Text>
            </View>
            <Text style={styles.noticeTitle}>{item.title}</Text>
            <Text style={styles.noticeSnippet} numberOfLines={2}>
              {item.content}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>👤 {item.author}</Text>
              <Text style={styles.footerText}>📅 {item.date}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Notice Detail Modal */}
      <Modal
        visible={!!selectedNotice}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedNotice(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedNotice && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalCategory}>{selectedNotice.category}</Text>
                  <TouchableOpacity onPress={() => setSelectedNotice(null)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalTitle}>{selectedNotice.title}</Text>
                <Text style={styles.modalAuthor}>
                  By {selectedNotice.author} • {selectedNotice.date}
                </Text>
                <View style={styles.divider} />
                <Text style={styles.modalBody}>{selectedNotice.content}</Text>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedNotice(null)}
                >
                  <Text style={styles.modalCloseBtnText}>Close Notice</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  searchBarContainer: {
    padding: 14,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#f8fafc',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryRow: {
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  categoryChipText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 14,
  },
  noticeCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryTag: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  priorityTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentTag: {
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
  },
  normalTag: {
    backgroundColor: '#065f46',
    color: '#6ee7b7',
  },
  noticeTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  noticeSnippet: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 8,
  },
  footerText: {
    color: '#64748b',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalCategory: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalAuthor: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 14,
  },
  modalBody: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  modalCloseBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
