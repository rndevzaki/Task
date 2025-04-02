import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Comment } from '@/types';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formattedDate = comment.createdAt.toLocaleString(); // Or use a date formatting library

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{comment.authorName}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>
      <Text style={styles.text}>{comment.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.greyLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  author: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});

export default CommentItem;
