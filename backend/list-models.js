// List available Gemini models
// Run: node list-models.js

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API Key not found in .env');
    process.exit(1);
  }
  
  console.log('🔍 Checking available Gemini models...\n');
  console.log(`API Key: ${apiKey.substring(0, 20)}...\n`);
  
  // Try v1 API
  console.log('📡 Testing v1 API endpoint...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ v1 API works! Available models:');
      if (data.models && data.models.length > 0) {
        data.models.forEach(model => {
          console.log(`  - ${model.name}`);
          console.log(`    Supported: ${model.supportedGenerationMethods?.join(', ')}`);
        });
      } else {
        console.log('  No models found');
      }
    } else {
      console.log('❌ v1 API failed:', data.error?.message || response.statusText);
    }
  } catch (error) {
    console.log('❌ v1 API error:', error.message);
  }
  
  console.log('\n');
  
  // Try v1beta API
  console.log('📡 Testing v1beta API endpoint...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ v1beta API works! Available models:');
      if (data.models && data.models.length > 0) {
        data.models.forEach(model => {
          console.log(`  - ${model.name}`);
          console.log(`    Supported: ${model.supportedGenerationMethods?.join(', ')}`);
        });
      } else {
        console.log('  No models found');
      }
    } else {
      console.log('❌ v1beta API failed:', data.error?.message || response.statusText);
    }
  } catch (error) {
    console.log('❌ v1beta API error:', error.message);
  }
  
  console.log('\n💡 Recommendation:');
  console.log('Use the model name from the list above that supports "generateContent"');
}

listModels();
