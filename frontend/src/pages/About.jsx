import React from 'react';
import { ShieldCheck, Truck, RefreshCw, ShoppingBag } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 font-khmer space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-khmer">អំពីពួកយើង</h1>
        <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
        <p className="text-slate-400 text-xs mt-2">ស្វែងយល់បន្ថែមអំពីប្រវត្តិនៃការបង្កើតហាង ZenTra Store</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 premium-shadow space-y-6 text-sm text-slate-600 leading-relaxed">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <ShoppingBag className="h-5 w-5 text-amber-500" />
          <span>ស្វាគមន៍មកកាន់ ZenTra Store!</span>
        </div>
        
        <p>
          ZenTra Store ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងផ្តល់ជូននូវសម្លៀកបំពាក់ទាន់សម័យ គុណភាពខ្ពស់ និងតម្លៃសមរម្យបំផុតសម្រាប់អតិថិជននៅក្នុងប្រទេសកម្ពុជា។ យើងខ្ញុំជឿជាក់ថា សម្លៀកបំពាក់មិនត្រឹមតែជាគ្រឿងបិទបាំងរាងកាយប៉ុណ្ណោះទេ ប៉ុន្តែវាក៏ជាការឆ្លុះបញ្ចាំងពីបុគ្គលិកលក្ខណៈ ទំនុកចិត្ត និងការរស់នៅទាន់សម័យរបស់លោកអ្នកផងដែរ។
        </p>

        <p>
          រាល់ផលិតផលទាំងអស់នៅក្នុងហាង ZenTra Store ត្រូវបានជ្រើសរើសយ៉ាងសម្រិតសម្រាំងបំផុត ចាប់តាំងពីសាច់ក្រណាត់ ម៉ូដរហូតដល់ការរចនាលម្អិត ដើម្បីធានាថាអតិថិជនទទួលបាននូវផលិតផលដែលពេញចិត្តបំផុត។
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 premium-shadow text-center space-y-3">
          <div className="p-3 bg-amber-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-amber-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">គុណភាពជាចម្បង</h4>
          <p className="text-xs text-slate-400">យើងខ្ញុំធានាជូននូវគុណភាពសាច់ក្រណាត់ល្អ មិនបែកព្រុយ មិនហើរពណ៌។</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 premium-shadow text-center space-y-3">
          <div className="p-3 bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-blue-600">
            <Truck className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">សេវាកម្មរហ័ស</h4>
          <p className="text-xs text-slate-400">សេវាដឹកជញ្ជូនរហ័សទាន់ចិត្ត និងមានសុវត្ថិភាពខ្ពស់ទូទាំងប្រទេស។</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 premium-shadow text-center space-y-3">
          <div className="p-3 bg-emerald-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-emerald-600">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">ទំនុកចិត្តខ្ពស់</h4>
          <p className="text-xs text-slate-400">រាល់ការទិញទំនិញត្រូវបានធានាសុវត្ថិភាព អាចប្តូរទំហំបានដោយងាយស្រួល។</p>
        </div>
      </div>
    </div>
  );
};

export default About;
