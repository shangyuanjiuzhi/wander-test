const OpenAI = require('openai');

const destinationInfo = {
  beijing: { name: 'Beijing', nameCN: '北京' },
  shanghai: { name: 'Shanghai', nameCN: '上海' },
  xian: { name: "Xi'an", nameCN: '西安' },
  chengdu: { name: 'Chengdu', nameCN: '成都' },
  hangzhou: { name: 'Hangzhou', nameCN: '杭州' },
  guilin: { name: 'Guilin', nameCN: '桂林' },
  lijiang: { name: 'Lijiang', nameCN: '丽江' },
  zhangjiajie: { name: 'Zhangjiajie', nameCN: '张家界' }
};

const standardWeather = {
  beijing: {
    spring: 'Temperature: 15-28°C · Day: 22°C · Night: 10°C · Occasional rain · Windy · Low humidity',
    summer: 'Temperature: 25-35°C · Day: 30°C · Night: 22°C · Rainy season · Humid · Thunderstorms',
    autumn: 'Temperature: 10-25°C · Day: 20°C · Night: 8°C · Sunny · Cool breeze · Low humidity',
    winter: 'Temperature: -5-5°C · Day: 0°C · Night: -10°C · Cold · Dry · Occasional snow'
  },
  shanghai: {
    spring: 'Temperature: 12-22°C · Day: 18°C · Night: 10°C · Rainy · Humid · Mild winds',
    summer: 'Temperature: 28-35°C · Day: 32°C · Night: 25°C · Hot · Humid · Thunderstorms',
    autumn: 'Temperature: 15-25°C · Day: 22°C · Night: 12°C · Sunny · Cool · Low humidity',
    winter: 'Temperature: 2-10°C · Day: 6°C · Night: 0°C · Cold · Damp · Occasional rain'
  },
  xian: {
    spring: 'Temperature: 12-25°C · Day: 20°C · Night: 8°C · Dry · Windy · Sunny',
    summer: 'Temperature: 26-35°C · Day: 30°C · Night: 22°C · Hot · Dry · Thunderstorms',
    autumn: 'Temperature: 8-22°C · Day: 18°C · Night: 6°C · Cool · Dry · Sunny',
    winter: 'Temperature: -8-5°C · Day: -2°C · Night: -12°C · Very cold · Dry · Snow'
  },
  chengdu: {
    spring: 'Temperature: 12-22°C · Day: 18°C · Night: 10°C · Mild · Humid · Overcast',
    summer: 'Temperature: 25-32°C · Day: 28°C · Night: 23°C · Hot · Humid · Rainy',
    autumn: 'Temperature: 13-22°C · Day: 19°C · Night: 11°C · Mild · Cool · Sunny',
    winter: 'Temperature: 5-12°C · Day: 9°C · Night: 4°C · Cool · Humid · Foggy'
  },
  hangzhou: {
    spring: 'Temperature: 12-22°C · Day: 18°C · Night: 10°C · Rainy · Humid · Mild',
    summer: 'Temperature: 28-35°C · Day: 32°C · Night: 26°C · Hot · Humid · Thunderstorms',
    autumn: 'Temperature: 15-25°C · Day: 21°C · Night: 13°C · Cool · Sunny · Low humidity',
    winter: 'Temperature: 4-12°C · Day: 8°C · Night: 2°C · Cold · Damp · Rainy'
  },
  guilin: {
    spring: 'Temperature: 15-25°C · Day: 21°C · Night: 12°C · Mild · Humid · Rainy',
    summer: 'Temperature: 28-35°C · Day: 32°C · Night: 26°C · Hot · Humid · Thunderstorms',
    autumn: 'Temperature: 18-28°C · Day: 24°C · Night: 16°C · Warm · Sunny · Low humidity',
    winter: 'Temperature: 8-16°C · Day: 12°C · Night: 6°C · Cool · Humid · Overcast'
  },
  lijiang: {
    spring: 'Temperature: 10-22°C · Day: 18°C · Night: 6°C · Dry · Sunny · Big temperature difference',
    summer: 'Temperature: 18-26°C · Day: 23°C · Night: 15°C · Mild · Rainy season · Cool',
    autumn: 'Temperature: 8-20°C · Day: 16°C · Night: 4°C · Cool · Dry · Sunny',
    winter: 'Temperature: -5-8°C · Day: 3°C · Night: -8°C · Cold · Dry · Sunny'
  },
  zhangjiajie: {
    spring: 'Temperature: 12-22°C · Day: 18°C · Night: 8°C · Mild · Rainy · Misty',
    summer: 'Temperature: 24-32°C · Day: 28°C · Night: 21°C · Hot · Humid · Thunderstorms',
    autumn: 'Temperature: 10-22°C · Day: 18°C · Night: 8°C · Cool · Sunny · Low humidity',
    winter: 'Temperature: 2-10°C · Day: 6°C · Night: -2°C · Cold · Dry · Occasional snow'
  }
};

function getSeason(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

function getSeasonCN(season) {
  const names = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' };
  return names[season];
}

function parseAIResponse(responseText) {
  const sections = responseText.split(/[\n\r]+/).filter(line => line.trim());
  const result = { weather: '', clothing: [], essentials: [], tips: '' };

  let currentSection = null;
  let weatherLines = [];

  sections.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    if (trimmedLine.toLowerCase().includes('temperature') || trimmedLine.includes('°C') ||
        trimmedLine.toLowerCase().includes('weather') || trimmedLine.toLowerCase().includes('climate') ||
        trimmedLine.toLowerCase().includes('average') || trimmedLine.toLowerCase().includes('daytime') ||
        trimmedLine.toLowerCase().includes('nighttime') || trimmedLine.toLowerCase().includes('humidity') ||
        trimmedLine.toLowerCase().includes('rain') || trimmedLine.toLowerCase().includes('wind') ||
        trimmedLine.toLowerCase().includes('sunny') || trimmedLine.toLowerCase().includes('cloudy')) {
      currentSection = 'weather';
      weatherLines.push(trimmedLine);
    } else if (trimmedLine.toLowerCase().includes('clothing') || trimmedLine.toLowerCase().includes('clothes') ||
               trimmedLine.toLowerCase().includes('shirt') || trimmedLine.toLowerCase().includes('pants') ||
               trimmedLine.toLowerCase().includes('jacket') || trimmedLine.toLowerCase().includes('shoes')) {
      currentSection = 'clothing';
    } else if (trimmedLine.toLowerCase().includes('essential') || trimmedLine.toLowerCase().includes('accessories') ||
               trimmedLine.toLowerCase().includes('gadgets') || trimmedLine.toLowerCase().includes('items') ||
               trimmedLine.toLowerCase().includes('personal')) {
      currentSection = 'essentials';
    } else if (trimmedLine.toLowerCase().includes('tips') || trimmedLine.toLowerCase().includes('note')) {
      currentSection = 'tips';
    } else if (currentSection === 'clothing' && (trimmedLine.match(/^[-•*]\s*(.+)/) || trimmedLine.match(/^\d+[.)]\s*(.+)/))) {
      const item = trimmedLine.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
      if (item && !result.clothing.includes(item)) result.clothing.push(item);
    } else if (currentSection === 'essentials' && (trimmedLine.match(/^[-•*]\s*(.+)/) || trimmedLine.match(/^\d+[.)]\s*(.+)/))) {
      const item = trimmedLine.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim();
      if (item && !result.essentials.includes(item)) result.essentials.push(item);
    } else if (currentSection === 'tips' && trimmedLine) {
      result.tips += trimmedLine + ' ';
    }
  });

  result.weather = weatherLines.join(' ');
  return result;
}

module.exports = async function handler(req, res) {
  console.log('API called with method:', req.method);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { destination, departureDate, returnDate } = req.body;
    
    console.log('Received parameters:', { destination, departureDate, returnDate });

    if (!destination || !departureDate || !returnDate) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const destInfo = destinationInfo[destination];
    if (!destInfo) {
      return res.status(400).json({ error: 'Invalid destination' });
    }

    const season = getSeason(departureDate);
    const seasonCN = getSeasonCN(season);

    const standardWeatherDesc = (standardWeather[destination] && standardWeather[destination][season]) 
      ? standardWeather[destination][season]
      : 'Temperature: 15-25°C · Day: 20°C · Night: 12°C · Variable weather';

    const prompt = `A user plans to travel to ${destInfo.name} from ${departureDate} to ${returnDate}. The season during this period is ${seasonCN}.

Based on historical weather data from the past 2 years for ${destInfo.name} during ${seasonCN}:

Requirements:
1. Weather: First line must start with "Temperature:" and include: temperature range (e.g., 15-28°C), average daytime temp (e.g., Day: 22°C), average nighttime temp (e.g., Night: 10°C), and weather conditions (rain, wind, humidity, sunny, cloudy, etc.)
2. Clothing: List 8-12 specific clothing items suitable for this weather (e.g., long sleeve shirts, jeans, light jacket, rain jacket, etc.)
3. Essentials: List 8-12 essential items (accessories, protective gear, practical gadgets)
4. Use bullet points (-) for clothing and essentials lists
5. Reply in English only, keep it concise`;

    console.log('API Key available:', !!process.env.DEEPSEEK_API_KEY);
    
    const deepseekClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY
    });

    console.log('Calling DeepSeek API...');
    
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a professional travel packing consultant. Provide accurate and specific clothing suggestions based on weather conditions. Format your response clearly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    console.log('DeepSeek API response received');
    console.log('AI Response:', completion.choices[0].message.content);
    
    const aiResponse = completion.choices[0].message.content;
    const parsedResponse = parseAIResponse(aiResponse);
    
    if (!parsedResponse.weather || !parsedResponse.weather.includes('Temperature')) {
      console.log('Using standard weather data');
      parsedResponse.weather = standardWeatherDesc;
    }

    res.json({
      success: true,
      destination: destInfo,
      season: seasonCN,
      departureDate,
      returnDate,
      suggestions: parsedResponse
    });

  } catch (error) {
    console.error('DeepSeek API Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to get suggestions from AI', details: error.message });
  }
};
