import React, { useState, useEffect } from 'react';

function InviteLink() {
  const [inviteCode, setInviteCode] = useState('');
  const [shareableLink, setShareableLink] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    generateInviteCode();
  }, []);

  const generateInviteCode = () => {
    // Generate a unique invite code
    const code = 'BARNBOWL' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/join/${code}`;
    setShareableLink(link);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied! 📋');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyMessage('Copied! 📋');
        setTimeout(() => setCopyMessage(''), 3000);
      } catch (fallbackErr) {
        setCopyMessage('Copy failed - please select and copy manually');
      }
      document.body.removeChild(textArea);
    }
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(
      `🏆 Join BARNBOWL - Premier League Predictions 2025/26! 🏆\n\n` +
      `Make your predictions, compete in weekly challenges, and see who really knows football!\n\n` +
      `Click here to join: ${shareableLink}\n\n` +
      `Use invite code: ${inviteCode}\n\n` +
      `⚽ Predict the final league table\n` +
      `🎯 Weekly mini-games and challenges\n` +
      `🏆 Leaderboards and bragging rights\n` +
      `📊 Track your prediction accuracy\n\n` +
      `Let's see who the real football genius is! 😄`
    );
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareToTelegram = () => {
    const message = encodeURIComponent(
      `🏆 Join BARNBOWL - Premier League Predictions! 🏆\n\n` +
      `${shareableLink}\n\n` +
      `Use code: ${inviteCode}`
    );
    
    window.open(`https://t.me/share/url?url=${shareableLink}&text=${message}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('🏆 Join BARNBOWL - Premier League Predictions!');
    const body = encodeURIComponent(
      `Hey!\n\n` +
      `You're invited to join BARNBOWL - our Premier League predictions competition for the 2025/26 season!\n\n` +
      `🏆 What we do:\n` +
      `• Predict the final Premier League table\n` +
      `• Weekly mini-games and challenges\n` +
      `• Compete for bragging rights\n` +
      `• Track everyone's accuracy\n\n` +
      `🔗 Join here: ${shareableLink}\n` +
      `📱 Use invite code: ${inviteCode}\n\n` +
      `Let's see who really knows football!\n\n` +
      `Cheers! ⚽`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📨 Invite Your Friends
        </h2>
        <p className="text-gray-600">
          Share this link to get your mates involved in the predictions mayhem!
        </p>
      </div>

      {/* Invite Code Display */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Invite Code</h3>
          <div className="text-3xl font-mono font-bold text-primary-600 mb-2">
            {inviteCode}
          </div>
          <p className="text-sm text-gray-600">
            Your friends can use this code to join directly
          </p>
        </div>
      </div>

      {/* Shareable Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shareable Link
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareableLink}
            readOnly
            className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
          />
          <button
            onClick={() => copyToClipboard(shareableLink)}
            className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            Copy
          </button>
        </div>
        {copyMessage && (
          <p className="text-green-600 text-sm mt-2">{copyMessage}</p>
        )}
      </div>

      {/* Share Buttons */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Quick Share</h3>
        
        <button
          onClick={shareToWhatsApp}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <span className="text-xl">💬</span>
          <span className="font-medium">Share on WhatsApp</span>
        </button>

        <button
          onClick={shareToTelegram}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span className="text-xl">📱</span>
          <span className="font-medium">Share on Telegram</span>
        </button>

        <button
          onClick={shareViaEmail}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-xl">📧</span>
          <span className="font-medium">Share via Email</span>
        </button>

        <button
          onClick={() => copyToClipboard(
            `🏆 Join BARNBOWL - Premier League Predictions! 🏆\n\n` +
            `Make your predictions and compete in weekly challenges!\n\n` +
            `Join: ${shareableLink}\nCode: ${inviteCode}\n\n` +
            `Let's see who knows football! ⚽`
          )}
          className="w-full flex items-center justify-center space-x-3 p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <span className="text-xl">📋</span>
          <span className="font-medium">Copy Message</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">How it works:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Share the link or invite code with your friends</li>
          <li>2. They click the link or enter the code</li>
          <li>3. They create their account and make predictions</li>
          <li>4. Everyone competes for glory! 🏆</li>
        </ol>
      </div>

      {/* Regenerate Button */}
      <div className="mt-4 text-center">
        <button
          onClick={generateInviteCode}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Generate New Invite Code
        </button>
      </div>
    </div>
  );
}

export default InviteLink;