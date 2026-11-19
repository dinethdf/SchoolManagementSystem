/**
 * Assignment Type Tag Component
 * 
 * Displays a lightweight category tag identifying the nature of an assignment:
 * - 'homework'  -> Indigo tag
 * - 'classwork' -> Purple tag
 * - 'project'   -> Cyan/Teal tag
 * 
 * Follows GEMINI.md Rules:
 * - Clear if/else branching
 * - Descriptive comments and variable names
 */

import React from 'react';
import { BookOpen, FileCode, FolderGit2 } from 'lucide-react';

export default function AssignmentTypeTag({ type = 'homework' }) {
  const normalizedType = type ? String(type).toLowerCase().trim() : 'homework';

  // -------------------------------------------------------------------------
  // Determine Tag Styling, Icon, and Label
  // -------------------------------------------------------------------------
  let tagClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let labelText = 'Homework';
  let IconComponent = BookOpen;

  if (normalizedType === 'homework') {
    tagClasses = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    labelText = 'Homework';
    IconComponent = BookOpen;
  } else if (normalizedType === 'classwork') {
    tagClasses = 'bg-purple-50 text-purple-700 border-purple-200';
    labelText = 'Classwork';
    IconComponent = FileCode;
  } else if (normalizedType === 'project') {
    tagClasses = 'bg-cyan-50 text-cyan-700 border-cyan-200';
    labelText = 'Project';
    IconComponent = FolderGit2;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${tagClasses}`}
    >
      <IconComponent size={12} className="shrink-0" />
      <span>{labelText}</span>
    </span>
  );
}
