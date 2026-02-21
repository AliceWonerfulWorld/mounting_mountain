'use client';

import Link from 'next/link';
import { MountainBackground } from '@/components/MountainBackground';

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* 時間帯に応じた背景 */}
      <MountainBackground />

      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="text-6xl mb-6">📧</div>
        
        <h1 className="text-3xl font-bold mb-4 text-amber-900">
          確認メールを送信しました
        </h1>

        <p className="text-gray-700 mb-6 leading-relaxed">
          登録したメールアドレスに確認メールを送信しました。
          <br />
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 ヒント：</strong>
            <br />
            メールが届かない場合は、迷惑メールフォルダを確認してください。
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          トップページに戻る
        </Link>
      </div>
    </main>
  );
}
