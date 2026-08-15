            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enOferta} onChange={(e) => setForm({ ...form, enOferta: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm font-medium text-gray-700">Producto en oferta</span>
              </label>
            </div>
            {/* 🔥 FIX #12: Mostrar campos de oferta SIEMPRE que enOferta sea true */}
            {form.enOferta && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio de oferta</label>
                  <input type="number" value={form.precioOferta} onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad en oferta <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input type="number" value={form.cantidadOferta} onChange={(e) => setForm({ ...form, cantidadOferta: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Todo el stock" min="1" />
                  <p className="text-xs text-gray-400 mt-1">
                    Vacío = todo el stock queda en oferta
                    {editando && form.cantidadOfertaVendida > 0 && ` • Vendidas: ${form.cantidadOfertaVendida}`}
                  </p>
                </div>
              </>
            )}