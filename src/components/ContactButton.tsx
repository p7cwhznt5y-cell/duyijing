import { useState } from "preact/hooks";

export function ContactButton() {
  const [showQR, setShowQR] = useState(false);

  const copyWeChat = () => {
    navigator.clipboard.writeText("绾绾wanny").then(() => {
      alert("微信号「绾绾wanny」已复制，请打开微信搜索添加");
    }).catch(() => {
      alert("复制失败，请手动搜索微信号：绾绾wanny");
    });
  };

  return (
    <>
      {/* 浮窗按钮 */}
      <button
        onClick={() => setShowQR(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-cinnabar text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-2xl"
        title="联系管理员"
      >
        💬
      </button>

      {/* 二维码弹窗 */}
      {showQR && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs mx-4 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQR(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors"
            >
              ✕
            </button>
            
            <h3 className="text-center font-serif text-lg font-bold text-ink mb-3">
              联系管理员
            </h3>
            
            <img
              src="/qrcode.jpg"
              alt="公众号二维码"
              className="w-full rounded-lg"
            />
            <p className="text-center text-sm text-gray-600 mt-3">
              长按识别二维码，关注公众号「绾绾wanny」
            </p>
            <a
              href="https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=Mzg4NTA2MDAzMg==#wechat_redirect"
              target="_blank"
             rel="noopener noreferrer"
             className="mt-4 w-full py-2.5 border border-cinnabar text-cinnabar rounded-lg text-sm font-medium hover:bg-cinnabar/5 transition-colors text-center block"
            >
             打开公众号主页
            </a>
            {/* 复制微信号按钮 */}
            <button
              onClick={copyWeChat}
              className="mt-4 w-full py-2.5 bg-cinnabar text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              复制微信号：绾绾wanny
            </button>
            
            <p className="text-center text-xs text-gray-400 mt-3">
              添加时备注"易经推演"，优先通过
            </p>
          </div>
        </div>
      )}
    </>
  );
}