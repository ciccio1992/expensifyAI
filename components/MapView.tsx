import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ReceiptData } from '../types';
import { X, Calendar, Filter } from 'lucide-react';
import * as L from 'leaflet';

interface MapViewProps {
  receipts: ReceiptData[];
  onClose: () => void;
  onSelectReceipt: (receipt: ReceiptData) => void;
  targetCurrency: string;
}

const MapView: React.FC<MapViewProps> = ({ receipts, onClose, onSelectReceipt, targetCurrency }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [filter, setFilter] = useState<'week' | 'month' | 'year' | 'all'>('all');
  const [markersLayer, setMarkersLayer] = useState<L.LayerGroup | null>(null);

  // Filter Logic
  const filteredReceipts = useMemo(() => {
    const now = new Date();
    return receipts.filter(r => {
      if (!r.latitude || !r.longitude) return false;
      const rDate = new Date(r.date);

      if (filter === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return rDate >= oneWeekAgo;
      }
      if (filter === 'month') {
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return rDate >= oneMonthAgo;
      }
      if (filter === 'year') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return rDate >= oneYearAgo;
      }
      return true;
    });
  }, [receipts, filter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView([20, 0], 2);

    // Dark mode friendly tiles (CartoDB Dark Matter) or standard OSM depending on preference. 
    // Using standard OSM for clarity but CSS filter could darken it.
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    setMarkersLayer(layerGroup);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    // Custom Icon (Simple Circle)
    const createIcon = (color: string) => L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    filteredReceipts.forEach(r => {
      if (r.latitude && r.longitude) {
        const marker = L.marker([r.latitude, r.longitude], {
          icon: createIcon(r.type === 'Business' ? '#6366f1' : '#a855f7')
        });

        // Create popup content as a DOM element to attach event listeners
        const popupContent = document.createElement('div');
        popupContent.className = "p-3 min-w-[200px] font-sans cursor-pointer hover:bg-gray-50 transition-colors rounded-lg";
        popupContent.innerHTML = `
                <div class="flex items-center justify-between mb-2 border-b pb-2 border-gray-100">
                    <span class="text-xs font-bold uppercase text-gray-400 tracking-wider">${r.category}</span>
                    <span class="text-xs text-gray-400">${r.date}</span>
                </div>
                <h3 class="font-bold text-base text-slate-900 mb-1 leading-tight">${r.merchantName}</h3>
                <p class="text-xs text-gray-500 mb-2 truncate">${r.merchantAddress || 'No address'}</p>
                <div class="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <span class="text-xs font-medium px-2 py-1 rounded-full ${r.type === 'Business' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}">
                        ${r.type}
                    </span>
                    <span class="font-bold text-lg text-slate-900">${targetCurrency} ${r.convertedAmount?.toFixed(2)}</span>
                </div>
                <div class="mt-2 text-center text-xs text-primary font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view details
                </div>
            `;

        // Attach click handler
        popupContent.addEventListener('click', () => {
          onSelectReceipt(r);
        });

        marker.bindPopup(popupContent);

        markersLayer.addLayer(marker);
        bounds.extend([r.latitude, r.longitude]);
        hasPoints = true;
      }
    });

    if (hasPoints && mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredReceipts, markersLayer, onSelectReceipt]);

  return (
    <div className="fixed inset-0 z-40 bg-white dark:bg-card flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white/90 dark:bg-card/90 backdrop-blur-md z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Filter size={28} className="text-primary" /> Expense Map
          </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-slate-900 dark:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-2 bg-gray-50 dark:bg-dark border-b border-gray-200 dark:border-gray-800 flex gap-2 overflow-x-auto">
        {(['week', 'month', 'year', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase whitespace-nowrap transition-colors ${filter === f
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
              : 'bg-white dark:bg-card text-gray-500 border border-gray-200 dark:border-gray-700'
              }`}
          >
            Last {f}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Legend */}
        <div className="absolute bottom-6 left-4 bg-white/90 dark:bg-card/90 backdrop-blur p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[400] text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-primary border border-white"></div>
            <span className="text-slate-900 dark:text-white">Business</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary border border-white"></div>
            <span className="text-slate-900 dark:text-white">Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;