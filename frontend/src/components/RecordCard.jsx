import React from 'react';
import { ClipboardCheck, Download, Stethoscope, User } from 'lucide-react';

const doctorName = (record) => record.Doctor?.User?.name || `Doctor #${record.doctorId}`;
const patientName = (record) =>
  record.Patient?.User?.name || `Patient #${record.patientId}`;

const prescriptions = (record) => record.Prescriptions || record.prescriptions || [];

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const printPrescription = (record) => {
  const items = prescriptions(record);
  const win = window.open('', '_blank', 'width=720,height=900');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>Prescription #${record.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
          h1 { font-size: 22px; margin: 0 0 16px; }
          .meta { margin-bottom: 20px; color: #475569; }
          .block { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; }
          .label { font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>Prescription</h1>
        <div class="meta">
          <div><span class="label">Visit:</span> ${escapeHtml(record.visitDate)}</div>
          <div><span class="label">Patient:</span> ${escapeHtml(patientName(record))}</div>
          <div><span class="label">Doctor:</span> ${escapeHtml(doctorName(record))}</div>
        </div>
        <div class="block"><span class="label">Diagnosis:</span> ${escapeHtml(record.diagnosis)}</div>
        <div class="block"><span class="label">Treatment:</span> ${escapeHtml(record.treatment)}</div>
        ${items
          .map(
            (item) => `
              <div class="block">
                <div><span class="label">Medicines:</span> ${escapeHtml(item.medicines)}</div>
                <div><span class="label">Dosage:</span> ${escapeHtml(item.dosageInstructions)}</div>
              </div>
            `
          )
          .join('')}
      </body>
    </html>
  `);
  win.document.close();
  win.print();
};

export default function RecordCard({ record }) {
  const recordPrescriptions = prescriptions(record);
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="text-brand-600" size={18} />
          <p className="font-semibold text-slate-800">Visit on {record.visitDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {recordPrescriptions.length > 0 && (
            <button
              type="button"
              onClick={() => printPrescription(record)}
              title="Print prescription"
              aria-label="Print prescription"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            >
              <Download size={15} />
            </button>
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">#{record.id}</span>
        </div>
      </div>
      <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
        <p className="flex items-center gap-2">
          <User size={16} className="text-slate-500" /> Patient: {patientName(record)}
        </p>
        <p className="flex items-center gap-2">
          <Stethoscope size={16} className="text-slate-500" /> Doctor: {doctorName(record)}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Diagnosis: </span>
          {record.diagnosis}
        </p>
        <p>
          <span className="font-semibold text-slate-700">Treatment: </span>
          {record.treatment}
        </p>
      </div>
      {record.notes && <p className="mt-2 text-sm text-slate-500">Notes: {record.notes}</p>}
      {recordPrescriptions.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {recordPrescriptions.map((prescription) => (
            <div key={prescription.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Medicines: </span>
                {prescription.medicines}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Dosage: </span>
                {prescription.dosageInstructions}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
