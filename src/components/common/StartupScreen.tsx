import { useState, useEffect } from 'react';

interface StartupScreenProps {
  onComplete: () => void;
}

/**
 * 启动画面组件
 * 显示"MAGI觉醒中"的打字效果，完成后触发面板滑入动画
 */
const StartupScreen = ({ onComplete }: StartupScreenProps) => {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 稍微延迟开始打字效果
    const startDelay = setTimeout(() => {
      setShowText(true);
    }, 500);

    // 打字完成后等待1秒，然后开始淡出
    const fadeDelay = setTimeout(() => {
      setFadeOut(true);
    }, 3500); // 500ms延迟 + 2000ms打字 + 1000ms等待

    // 淡出完成后通知父组件 - 延长时间让面板滑入动画更明显
    const completeDelay = setTimeout(() => {
      onComplete();
    }, 5000); // 给面板滑入留更多时间

    return () => {
      clearTimeout(startDelay);
      clearTimeout(fadeDelay);
      clearTimeout(completeDelay);
    };
  }, [onComplete]);

  return (
    <div className={`startup-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="startup-text">
        {showText && (
          <div className="typewriter">
            MAGI覺醒中
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupScreen;