import {
  BadgePercent,
  Building2,
  CreditCard,
  Info,
  Landmark,
} from 'lucide-react';
import { registrationInfo } from '@/features/home/data';
import CopyAccountButton from './CopyAccountButton';

export default function PaymentInformation() {
  return (
    <section
      id="biaya"
      aria-labelledby="payment-title"
      className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[#007A10]">
            Informasi Pembayaran
          </p>
          <h2
            id="payment-title"
            className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl"
          >
            Rincian transparan untuk persiapan yang tenang
          </h2>
          <p className="mt-4 leading-7 text-gray-600">
            Pelajari biaya, skema cicilan, dan potongan uang bangunan sebelum
            mengisi formulir.
          </p>
        </div>

        <article className="mt-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#00550B] via-[#007A10] to-[#00A315] p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                <Landmark size={18} /> Pembayaran OKB
              </p>
              <p className="mt-3 text-sm text-emerald-100">
                {registrationInfo.okb.bank}
              </p>
              <p className="mt-1 select-all font-mono text-3xl font-black tracking-wider sm:text-4xl">
                {registrationInfo.okb.accountNumber}
              </p>
              <p className="mt-3 text-sm text-emerald-50">
                Nominal transfer: <strong>{registrationInfo.okb.fee}</strong>
              </p>
            </div>
            <CopyAccountButton accountNumber={registrationInfo.okb.accountNumber} />
          </div>
        </article>

        <div className="mt-12 hidden overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 sm:block">
          <table className="w-full table-fixed">
            <caption className="sr-only">
              Rincian biaya pendaftaran Takhossus dan Reguler
            </caption>
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead className="bg-gray-950 text-white">
              <tr>
                <th scope="col" className="px-7 py-5 text-left font-black">
                  Iuran
                </th>
                <th scope="col" className="px-4 py-5 text-center text-sm font-bold">
                  Takhossus
                </th>
                <th scope="col" className="px-4 py-5 text-center text-sm font-bold">
                  Reguler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registrationInfo.fees.map((item) => (
                <tr key={item.label}>
                  <th
                    scope="row"
                    className="px-7 py-4 text-left align-top font-semibold text-gray-900"
                  >
                    <span className="block">{item.label}</span>
                    {'detail' in item && item.detail && (
                      <>
                        {' '}
                        <span className="mt-1 block text-xs font-normal leading-5 text-gray-500">
                          {item.detail}
                        </span>
                      </>
                    )}
                  </th>
                  <td className="px-4 py-4 text-center align-top font-bold text-gray-900">
                    {item.takhossus}
                  </td>
                  <td className="px-4 py-4 text-center align-top font-bold text-gray-900">
                    {item.regular}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-emerald-50">
              <tr>
                <th scope="row" className="px-7 py-5 text-left font-black text-gray-950">
                  Jumlah total
                </th>
                <td className="px-4 py-5 text-center text-lg font-black text-[#007A10]">
                  {registrationInfo.totals.takhossus}
                </td>
                <td className="px-4 py-5 text-center text-lg font-black text-[#007A10]">
                  {registrationInfo.totals.regular}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/50 sm:hidden">
          <h3 className="bg-gray-950 px-5 py-5 font-black text-white">
            Rincian iuran
          </h3>
          <div className="divide-y divide-gray-100">
            {registrationInfo.fees.map((item) => (
              <article key={item.label} className="px-5 py-4">
                <p className="font-semibold text-gray-900">{item.label}</p>
                {'detail' in item && item.detail && (
                  <p className="mt-1 break-words text-xs leading-5 text-gray-500">
                    {item.detail}
                  </p>
                )}
                <dl className="mt-3 grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-gray-600">Takhossus</dt>
                    <dd className="mt-1 break-words font-bold text-gray-900">
                      {item.takhossus}
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-gray-600">Reguler</dt>
                    <dd className="mt-1 break-words font-bold text-gray-900">
                      {item.regular}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="bg-emerald-50 px-5 py-5">
            <p className="font-black text-gray-950">Jumlah total</p>
            <dl className="mt-3 grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <dt className="text-xs font-bold text-gray-600">Takhossus</dt>
                <dd className="mt-1 break-words font-black text-[#007A10]">
                  {registrationInfo.totals.takhossus}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-bold text-gray-600">Reguler</dt>
                <dd className="mt-1 break-words font-black text-[#007A10]">
                  {registrationInfo.totals.regular}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-6">
            <p className="flex items-center gap-2 text-sm font-black text-[#007A10]">
              <Building2 size={18} /> Kelas Takhossus
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {registrationInfo.classPrograms.takhossus}
            </p>
          </article>
          <article className="rounded-3xl border border-sky-100 bg-sky-50/60 p-6">
            <p className="flex items-center gap-2 text-sm font-black text-sky-800">
              <CreditCard size={18} /> Kelas Reguler
            </p>
            <p className="mt-2 text-sm text-gray-600">
              {registrationInfo.classPrograms.regular}
            </p>
          </article>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/40 sm:p-8">
            <h3 className="text-xl font-black text-gray-950">Jadwal pembayaran</h3>
            <div className="mt-5 space-y-4">
              {registrationInfo.installments.map((item) => (
                <div
                  key={item.stage}
                  className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-gray-950">
                        Tahap {item.stage}{' '}
                        <span className="text-[#007A10]">({item.percentage})</span>
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {item.timing}
                      </p>
                    </div>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-bold text-gray-600">Takhossus</dt>
                      <dd className="mt-1 font-black">{item.takhossus}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold text-gray-600">Reguler</dt>
                      <dd className="mt-1 font-black">{item.regular}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-3xl border border-amber-100 bg-amber-50/60 p-6 shadow-lg shadow-amber-100/30 sm:p-8">
            <h3 className="flex items-center gap-2 text-xl font-black text-gray-950">
              <BadgePercent className="text-amber-600" /> Diskon uang bangunan
            </h3>
            <div className="mt-5 space-y-5">
              {registrationInfo.discounts.map((discount) => (
                <div key={discount.percentage}>
                  <p className="inline-flex rounded-full bg-amber-200 px-3 py-1 text-xs font-black text-amber-950">
                    Diskon {discount.percentage}
                  </p>
                  <ul className="mt-3 space-y-2">
                    {discount.criteria.map((criterion) => (
                      <li
                        key={criterion}
                        className="flex gap-2 text-sm leading-6 text-gray-700"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                        />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        </div>

        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-blue-950">
          <Info className="mt-0.5 shrink-0 text-blue-600" size={18} />
          <span>{registrationInfo.registrationNote}</span>
        </p>
      </div>
    </section>
  );
}
