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
    spring: 'Temperature ranges from 15°C to 28°C during the day, dropping to 8°C to 15°C at night',
    summer: 'Temperature ranges from 25°C to 35°C during the day, dropping to 18°C to 25°C at night',
    autumn: 'Temperature ranges from 10°C to 25°C during the day, dropping to 2°C to 12°C at night',
    winter: 'Temperature ranges from -5°C to 5°C during the day, dropping to -15°C to -5°C at night'
  },
  shanghai: {
    spring: 'Temperature ranges from 12°C to 22°C during the day, dropping to 6°C to 12°C at night',
    summer: 'Temperature ranges from 28°C to 35°C during the day, dropping to 22°C to 28°C at night',
    autumn: 'Temperature ranges from 15°C to 25°C during the day, dropping to 8°C to 15°C at night',
    winter: 'Temperature ranges from 2°C to 10°C during the day, dropping to -2°C to 5°C at night'
  },
  xian: {
    spring: 'Temperature ranges from 12°C to 25°C during the day, dropping to 5°C to 12°C at night',
    summer: 'Temperature ranges from 26°C to 35°C during the day, dropping to 18°C to 25°C at night',
    autumn: 'Temperature ranges from 8°C to 22°C during the day, dropping to 0°C to 10°C at night',
    winter: 'Temperature ranges from -8°C to 5°C during the day, dropping to -15°C to -5°C at night'
  },
  chengdu: {
    spring: 'Temperature ranges from 12°C to 22°C during the day, dropping to 8°C to 14°C at night',
    summer: 'Temperature ranges from 25°C to 32°C during the day, dropping to 20°C to 25°C at night',
    autumn: 'Temperature ranges from 13°C to 22°C during the day, dropping to 8°C to 14°C at night',
    winter: 'Temperature ranges from 5°C to 12°C during the day, dropping to 2°C to 8°C at night'
  },
  hangzhou: {
    spring: 'Temperature ranges from 12°C to 22°C during the day, dropping to 6°C to 12°C at night',
    summer: 'Temperature ranges from 28°C to 35°C during the day, dropping to 23°C to 28°C at night',
    autumn: 'Temperature ranges from 15°C to 25°C during the day, dropping to 10°C to 16°C at night',
    winter: 'Temperature ranges from 4°C to 12°C during the day, dropping to 1°C to 7°C at night'
  },
  guilin: {
    spring: 'Temperature ranges from 15°C to 25°C during the day, dropping to 10°C to 16°C at night',
    summer: 'Temperature ranges from 28°C to 35°C during the day, dropping to 23°C to 28°C at night',
    autumn: 'Temperature ranges from 18°C to 28°C during the day, dropping to 12°C to 18°C at night',
    winter: 'Temperature ranges from 8°C to 16°C during the day, dropping to 4°C to 10°C at night'
  },
  lijiang: {
    spring: 'Temperature ranges from 10°C to 22°C during the day, dropping to 2°C to 10°C at night',
    summer: 'Temperature ranges from 18°C to 26°C during the day, dropping to 12°C to 18°C at night',
    autumn: 'Temperature ranges from 8°C to 20°C during the day, dropping to 0°C to 8°C at night',
    winter: 'Temperature ranges from -5°C to 8°C during the day, dropping to -12°C to -3°C at night'
  },
  zhangjiajie: {
    spring: 'Temperature ranges from 12°C to 22°C during the day, dropping to 6°C to 12°C at night',
    summer: 'Temperature ranges from 24°C to 32°C during the day, dropping to 18°C to 24°C at night',
    autumn: 'Temperature ranges from 10°C to 22°C during the day, dropping to 4°C to 12°C at night',
    winter: 'Temperature ranges from 2°C to 10°C during the day, dropping to -5°C to 3°C at night'
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

  sections.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    if (trimmedLine.toLowerCase().includes('temperature') || trimmedLine.toLowerCase().includes('weather') || trimmedLine.toLowerCase().includes('climate') || trimmedLine.toLowerCase().includes('average')) {
      currentSection = 'weather';
      if (!result.weather) result.weather = trimmedLine;
      else result.weather += ' ' + trimmedLine;
    } else if (trimmedLine.toLowerCase().includes('clothing') || trimmedLine.toLowerCase().includes('clothes') || trimmedLine.toLowerCase().includes('shirt') || trimmedLine.toLowerCase().includes('pants')) {
      currentSection = 'clothing';
    } else if (trimmedLine.toLowerCase().includes('essential') || trimmedLine.toLowerCase().includes('accessories') || trimmedLine.toLowerCase().includes('gadgets') || trimmedLine.toLowerCase().includes('items')) {
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
      : `Temperature ranges from 15°C to 25°C during the day, dropping to 10°C to 18°C at night`;

    const prompt = `A user plans to travel to ${destInfo.name} from ${departureDate} to ${returnDate}. The season during this period is ${seasonCN}.

Based on the historical weather data from the past 2 years for ${destInfo.name} during ${seasonCN}, please provide:
1. Average temperature range (day and night)
2. Common weather conditions (rain, wind, humidity, sunny days, etc.)
3. Any notable weather patterns

Then provide travel packing information based on the typical weather during this period.

Requirements:
1. Weather: Describe the historical average weather for this time of year in ${destInfo.name}
2. Clothing: List 8-12 specific clothing items suitable for this weather (e.g., long sleeve shirts, jeans, light jacket, etc.). Include items appropriate for the specific weather conditions (rain, wind, sun, etc.)
3. Essentials: List 8-12 essential items (accessories, protective gear, practical gadgets)
4. Reply in English, separate each section with a blank line, no extra text`;

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
          content: 'You are a professional travel packing consultant. Provide accurate and specific clothing suggestions based on the weather conditions provided. Your answers should be practical and tailored to the weather.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    console.log('DeepSeek API response received');
    
    const aiResponse = completion.choices[0].message.content;
    const parsedResponse = parseAIResponse(aiResponse);
    
    if (!parsedResponse.weather) {
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
