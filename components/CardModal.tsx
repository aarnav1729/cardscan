import React from "react";
import { BusinessCard } from "../types";

interface CardModalProps {
  card: BusinessCard;
  onClose: () => void;
}

export const CardModal: React.FC<CardModalProps> = ({ card, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200">
        {/* Image Preview Side */}
        <div className="w-full md:w-1/2 bg-slate-900 flex items-center justify-center p-4 md:p-8">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={card.imageUrl}
              alt="Scanned card"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute top-0 right-0 p-4 block md:hidden">
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Details Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">
                {card.name || "Empty Name"}
              </h2>
              <p className="text-lg text-indigo-600 font-medium">
                {card.jobTitle || "No Title Specified"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="hidden md:block p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <DetailItem
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              }
              label="Company"
              value={card.companyName}
            />
            <DetailItem
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              }
              label="Email"
              value={card.email}
              isLink
              href={`mailto:${card.email}`}
            />
            <DetailItem
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              }
              label="Phone"
              value={card.phone}
              isLink
              href={`tel:${card.phone}`}
            />
            <DetailItem
              icon={
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18"
                />
              }
              label="Website"
              value={card.website}
              isLink
              href={
                card.website && !card.website.startsWith("http")
                  ? `https://${card.website}`
                  : card.website
              }
            />

            {/* --- FIX IS HERE: Added <> and </> around the two path elements --- */}
            <DetailItem
              icon={
                <>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </>
              }
              label="Address"
              value={card.address}
            />
          </div>

          <div className="mt-12 flex space-x-4">
            <button
              onClick={() => {
                const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${card.name}\nORG:${card.companyName}\nTITLE:${card.jobTitle}\nTEL:${card.phone}\nEMAIL:${card.email}\nURL:${card.website}\nADR:;;${card.address}\nEND:VCARD`;
                const blob = new Blob([vcard], { type: "text/vcard" });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", `${card.name || "contact"}.vcf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span>Export vCard</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon,
  label,
  value,
  isLink,
  href,
}) => {
  if (!value) return null;

  return (
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        {isLink ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium break-all"
          >
            {value}
          </a>
        ) : (
          <p className="text-slate-700 font-medium break-words">{value}</p>
        )}
      </div>
    </div>
  );
};
