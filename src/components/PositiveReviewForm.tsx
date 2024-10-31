import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography
} from '@mui/material';


const PositiveReviewForm: React.FC = () => {
  const { state } = useLocation();
  const { visitDate, heardFrom, usagePurpose, satisfiedPoints, improvementPoints, satisfaction } = state || {}; // SurveyFormから渡されたデータ
  const navigate = useNavigate();
  const [Feedback, setFeedback] = useState('');

  const handleBack = () => {
    //　「戻る」ボタンを押した際に、入力内容を保持してSurveyFormに戻る
    navigate('/surveyform', {
      state: 
      {
        visitDate,
        heardFrom,
        usagePurpose,
        satisfiedPoints,
        improvementPoints,
        satisfaction,
      }
    })
  }

  const handleNext = () => {
    // バリデーションチェック
    if (satisfaction === null) {
      alert('当施設への満足度を選択してください。');
      return;
    }

    // SurveyFormとReviewFormのデータをすべてConfirmationに渡す
    navigate('/confirmation', {
      state: {
        // SurveyFormのデータ
        visitDate,
        heardFrom,
        usagePurpose,
        satisfiedPoints,
        improvementPoints,
        satisfaction,
        // ReviewFormのデータ
        Feedback,
      }
    });
  };

  return (
    <Box
      component="form"
      sx={{
        maxWidth: 600,
        margin: '0 auto',
        backgroundColor: '#e0f7fa',
        padding: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={4}>
        施設ご利用後のご感想
      </Typography>

      <Typography variant="body1" textAlign="left" mb={4}>
        <div>
          この度の当施設ご利用に際して感じられたことを、このページにご記入ください。
        </div>
        <div>
          お客様からの貴重なご意見を参考に、より良い施設づくりに役立てさせていただきます。
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
        <FormControl fullWidth margin="normal" required>
          <FormLabel>
            当施設ご利用後のご感想
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
          <TextField
            multiline
            rows={8}
            placeholder="当施設ご利用後の感想をご記入ください"
            value={Feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
        </FormControl>
      </Box>

      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button variant="outlined" color="secondary" onClick={handleBack}>
          戻る
        </Button>
        <Button variant="contained" color="primary" onClick={handleNext}>
          確認画面へ
        </Button>
      </Box>
    </Box>
  );
};

export default PositiveReviewForm;