import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PinCodeInput from '../../components/PinCodeInput/PinCodeInput';
import './CribCam.css';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import { NanitAccount } from '../../models/nanitAccount';

const CribCam: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nanitAccount, setNanitAccount] = useState<NanitAccount | undefined>(undefined);
  const [showPinCode, setShowPinCode] = useState(false);
  const [showMfaCode, setShowMfaCode] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [babyToken, setBabyToken] = useState('');
  const [error, setError] = useState('');

const nanitAccounts: NanitAccount[] = JSON.parse(import.meta.env.VITE_NANIT_ACCOUNTS || '[]');
  const babyId = import.meta.env.VITE_BABY_ID;

  const handlePinComplete = (enteredCode: string) => {
    const account = nanitAccounts.find(a => a.pinCode == enteredCode);

    setNanitAccount(account);

    if (account) {
      setShowPinCode(false);
      setLoading(true);
      login(account);
      setLoading(false);
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  const resetPage = async () =>{
    setShowPinCode(true);
  }

  const captureAccessToken = async(text : string) =>{
      const lines = text.trim().split('\n');
      const accessTokenLine = lines.find(l => l.includes("accessToken"));
      if(accessTokenLine)
        {
          return await getJsonFromText(accessTokenLine);
        }
      return null;
      }

      
  const getApiUrl = (resource : string) =>
    `/api/nanit/${resource}`;
    //`http://localhost:3001/nanit/${resource}`;

  const handleMfaComplete = async (mfaCode: string) => {
    try {
      const mfaResponse =await fetch(getApiUrl('verify-mfa'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mfaCode: mfaCode,
          email: nanitAccount?.email,
          password: nanitAccount?.password,
          mfaToken: mfaToken,
          phoneSuffix: nanitAccount?.phoneSuffix
        }),
      });

      const mfaResponseText = (await mfaResponse.text()).trim();

      const accessToken = await captureAccessToken(mfaResponseText);

      if(accessToken)
      {
        startVideo(accessToken.session.accessToken);
      }
      
    } catch (error) {
      console.error('MFA verification error:', error);
      setError('Invalid MFA code. Please try again.');
    }
  };



  const getJsonFromText = async (text : string) => {
    const json = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    return JSON.parse(json);
  }


  const login = async (account: NanitAccount) => {
    try {
      const loginResponse = await fetch(getApiUrl('login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: account.email,
          password: account.password,
        }),
      });

      const responseText = (await loginResponse.text()).trim();
      const lines = responseText.trim().split('\n');

      const mfaRequiredLine = lines.find(l => l.includes("mfa_required"));

      if(mfaRequiredLine)
      {
        const mfaJson = await getJsonFromText(mfaRequiredLine);

        setMfaToken(mfaJson.data.mfaToken);
        setShowMfaCode(true);
      }
      else
      {
        const accessToken = await captureAccessToken(responseText);
        if(accessToken)
        {
          startVideo(accessToken.data.accessToken);
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  const startVideo = async (token : string) => {
    try {
      const babyTokenResponse = await fetch(getApiUrl('baby-token'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          babyId: babyId
        }),
      });

      const babyTokenText = await babyTokenResponse.text();

      setBabyToken(babyTokenText);
    }
    catch(error)
    {
      console.error('Baby token error:', error);
      setError('Baby token failed. Please try again.');
    }
  };

  useEffect(() => {
    setLoading(true);
    setShowPinCode(nanitAccount == undefined);
    setLoading(false);
  }, [navigate]);


  return (
  <div className="crib-cam">
    {loading ? (
      <div>
        <h2>Loading Crib Cam...</h2>
        <p>Please wait while we connect to Leonardo's camera...</p>
      </div>
    ) : babyToken ? (
      <VideoPlayer 
        src={getApiUrl('video')}
        authToken={babyToken}
        autoPlay={true}
        autoFullScreen={true}
        controls={true}
      />
    ) : showMfaCode ? (
      <div className="pin-code-verification">
        <h2>MFA Code Required</h2>
        <p>Please enter the 4-digit MFA code:</p>
        <PinCodeInput onComplete={handleMfaComplete} />
        {error && <p className="error-message">{error}</p>}
      </div>
    ) : showPinCode ? (
      <div className="pin-code-verification">
        <h2>Enter Pin Code</h2>
        <p>Please enter your 4-digit pin code:</p>
        <PinCodeInput onComplete={handlePinComplete} />
        {error && <p className="error-message">{error}</p>}
      </div>
    ) : (
      <div className="login-container">
        <h2>Leonardo's Crib Cam</h2>
        <p>Click the button below to connect to the camera</p>
        <button onClick={resetPage} className="connect-button">
          Connect to Camera
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    )}
  </div>
);
};

export default CribCam;