import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

// ------------------------------
// 1. SurveyForm.tsx と同じ型定義を用意 (serviceKeyとconfig)
// ------------------------------
type ServiceKey = 'childDevelopmentSupport' | 'afterSchoolDayService' | 'lifeCare';

interface ServiceDefinition {
  key: ServiceKey;
  label: string;
  satisfiedOptions: string[];
  improvementOptions: string[];
}

interface SurveyConfig {
  heardFromOptions: string[];
  serviceDefinitions: ServiceDefinition[];
}

const GoogleAccount: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // ① 環境変数からURL/エンドポイントを取得
  const googleReviewUrl = process.env.REACT_APP_GMAP_REVIEW_URL || 'https://www.google.com/maps';
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || '';

  // SurveyConfigを読み込み(SSMパラメータをビルド時に埋め込んだもの)
  const [surveyConfig, setSurveyConfig] = useState<SurveyConfig | null>(null);

  // マウント時にREACT_APP_SURVEY_CONFIGをパース
  useEffect(() => {
    const rawConfig = process.env.REACT_APP_SURVEY_CONFIG;
    if (!rawConfig) {
      console.error('REACT_APP_SURVEY_CONFIG is not defined!');
      return;
    }
    try {
      const parsed = JSON.parse(rawConfig) as SurveyConfig;
      setSurveyConfig(parsed);
    } catch (err) {
      console.error('Failed to parse REACT_APP_SURVEY_CONFIG:', err);
    }
  }, []);

  // serviceKey -> label を返すヘルパー
  const getLabelFromKey = (key: ServiceKey): string => {
    if (!surveyConfig) return '';
    const found = surveyConfig.serviceDefinitions.find((item) => item.key === key);
    return found ? found.label : '';
  };

  // usagePurpose は serviceKey[] (SurveyForm.tsx でそう送ってきた想定)
  const usagePurposeKeys: ServiceKey[] = state?.usagePurpose || [];

  // usagePurposeKeys をラベルに変換した配列を作る
  const usagePurposeLabels = usagePurposeKeys.map((key) => getLabelFromKey(key));

  const [hasGoogleAccount, setHasGoogleAccount] = useState<string>('');

  // 必要であればデストラクチャリングしておく
  const {
    visitDate,
    heardFrom,
    satisfiedPoints,
    improvementPoints,
    satisfaction,
  } = state || {};

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const data = {
      // state から取得した各種値を使う
      visitDate,
      heardFrom,
      usagePurposeKeys,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
      satisfaction,
    };

    if (!hasGoogleAccount) {
      alert('Googleアカウントをお持ちですか？の質問に回答してください。');
      return;
    }

    // 送信データの確認
    console.log('送信するstateの中身', {
      visitDate,
      heardFrom,
      usagePurposeKeys,
      usagePurposeLabels,
      satisfiedPoints,
      improvementPoints,
      satisfaction,
    });

    if (hasGoogleAccount === 'yes') {
      // ② API Gateway へデータを送信
      if (!apiEndpoint) {
        alert('APIエンドポイントが設定されていません。');
        return;
      }

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          // サーバーが 200系以外を返した場合
          console.error('サーバーエラー:', response.statusText);
          alert('データ送信中にエラーが発生しました。');
          return;
        }

        // 送信成功後に GoogleMap 口コミ投稿ページへ遷移
        window.location.href = googleReviewUrl;
      } catch (error) {
        console.error('ネットワークエラー:', error);
        alert('ネットワークエラーが発生しました。');
      }
    } else {
      // Googleアカウントがない場合は感想入力画面へ遷移
      navigate('/previewform', {
        state: {
          ...state,
          hasGoogleAccount,
        },
      });
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#e0f7fa',
        padding: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={4} className="text">
        {'Google Map口コミ\n投稿のご依頼'}
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>
          当施設のサービスをご利用いただいた際の感想をぜひGoogle Mapの口コミとして投稿していただけますと幸いです！
        </div>
      </Typography>

      <Box
        sx={{
          backgroundColor: '#fff',
          padding: 2,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: 3,
        }}
      >
        <FormControl component="fieldset" fullWidth margin="normal" required>
          <FormLabel component="legend">
            Googleアカウントをお持ちですか？
            <Typography
              component="span"
              sx={{
                color: 'white',
                backgroundColor: 'red',
                borderRadius: 1,
                padding: '0 4px',
                marginLeft: 1,
                display: 'inline-block',
                fontSize: '0.8rem',
              }}
            >
              必須
            </Typography>
          </FormLabel>
          <RadioGroup
            value={hasGoogleAccount}
            onChange={(e) => setHasGoogleAccount(e.target.value)}
          >
            <FormControlLabel value="yes" control={<Radio />} label="はい" />
            <FormControlLabel value="no" control={<Radio />} label="いいえ" />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="outlined" color="secondary" onClick={() => navigate(-1)}>
          戻る
        </Button>
        <Button variant="contained" color="primary" type="submit">
          感想入力画面へ
        </Button>
      </Box>
    </Box>
  );
};

export default GoogleAccount;
