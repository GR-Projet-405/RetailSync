import React, { useRef } from 'react';
import { UploadCloud, FileText, X, CheckCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

const DOC_TYPES = [
  {
    key: 'contract',
    label: 'Contract / Agreement',
    hint: 'Signed supplier contract or master agreement',
    accept: '.pdf,.doc,.docx',
  },
  {
    key: 'iso',
    label: 'ISO Certificate',
    hint: 'ISO 9001, 14001 or other certification documents',
    accept: '.pdf,.png,.jpg',
  },
  {
    key: 'w9',
    label: 'W9 / Purchase Agreement',
    hint: 'IRS W9 form or purchase framework agreement',
    accept: '.pdf,.doc,.docx',
  },
  {
    key: 'insurance',
    label: 'Insurance Certificate',
    hint: 'Proof of current liability insurance coverage',
    accept: '.pdf,.png,.jpg',
  },
];

// ─── Single Upload Zone ───────────────────────────────────────────────────────
const UploadZone = ({ docType, file, onFileChange }) => {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileChange(docType.key, dropped);
  };

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFileChange(docType.key, selected);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">{docType.label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{docType.hint}</p>
        </div>
        {file && (
          <button
            onClick={() => onFileChange(docType.key, null)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {file ? (
        /* Uploaded State */
        <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
          </div>
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
        </div>
      ) : (
        /* Drop Zone */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all duration-150 group"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 group-hover:border-blue-200 flex items-center justify-center transition-colors">
            <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
            Drop file here or <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-slate-400">Supports: {docType.accept.split(',').join(', ')}</p>
          <input
            ref={inputRef}
            type="file"
            accept={docType.accept}
            className="hidden"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

// ─── Step 5: Documents ────────────────────────────────────────────────────────
const Documents = ({ data, onChange }) => {
  const handleFileChange = (key, file) => {
    onChange({ ...data, [key]: file });
  };

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Documents</h2>
        <p className="text-sm text-slate-500 mt-0.5">Upload required compliance and legal documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DOC_TYPES.map(docType => (
          <UploadZone
            key={docType.key}
            docType={docType}
            file={data[docType.key] ?? null}
            onFileChange={handleFileChange}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Upload Summary</h3>
        <div className="space-y-2">
          {DOC_TYPES.map(docType => {
            const file = data[docType.key];
            return (
              <div key={docType.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{docType.label}</span>
                <span className={cn(
                  'flex items-center gap-1 text-xs font-semibold',
                  file ? 'text-emerald-600' : 'text-slate-400'
                )}>
                  {file ? (
                    <><CheckCircle className="w-3.5 h-3.5" /> Uploaded</>
                  ) : (
                    'Not uploaded'
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        All documents are optional but recommended. They can also be uploaded later from the supplier profile.
      </p>
    </div>
  );
};

export default Documents;
