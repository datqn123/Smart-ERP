import { useEffect } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { mockTopProducts } from "../mockData"
import { formatCurrency } from "@/features/inventory/utils"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function TopProductsPage() {
  const { setTitle } = usePageTitle()
  useEffect(() => { setTitle("Sản phẩm bán chạy") }, [setTitle])

  const sortedByQty = [...mockTopProducts].sort((a, b) => b.quantitySold - a.quantitySold)
  const sortedByRev = [...mockTopProducts].sort((a, b) => b.revenue - a.revenue)

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 h-full overflow-y-auto bg-slate-50/30">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sản phẩm bán chạy</h1>
        <p className="text-sm text-slate-500 mt-1">Xếp hạng các mặt hàng có doanh số tốt nhất</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart by Quantity */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 font-display">Top 5 Sản phẩm theo số lượng</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedByQty} layout="vertical" margin={{ left: 40, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={150}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="quantitySold" name="Số lượng" radius={[0, 4, 4, 0]} barSize={24}>
                  {sortedByQty.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart by Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[450px]">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 font-display">Cơ cấu doanh thu Top sản phẩm</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sortedByRev}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {sortedByRev.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Chi tiết doanh số</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mã SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Tên sản phẩm</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Số lượng bán</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Doanh thu</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedByRev.map((item, index) => {
                const totalRev = sortedByRev.reduce((a, b) => a + b.revenue, 0)
                const percent = (item.revenue / totalRev) * 100
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">{item.skuCode}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-right text-slate-700 font-semibold">{item.quantitySold.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right text-emerald-600 font-bold">{formatCurrency(item.revenue)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{percent.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
