import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const EF_BASE = 'https://push2.eastmoney.com/api/qt';

app.use(cors());
app.use(express.json());

const getSecId = (symbol) => {
  if (symbol.startsWith('6')) return `1.${symbol}`;
  if (symbol.startsWith('0') || symbol.startsWith('3')) return `0.${symbol}`;
  return `1.${symbol}`;
};

app.get('/api/quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ error: 'Missing symbols parameter' });
    }

    const symbolList = symbols.split(',');
    const secids = symbolList.map(getSecId).join(',');
    
    const url = `${EF_BASE}/ulist.np/get?pn=1&pz=${symbolList.length}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&secids=${secids}&fields=f1,f2,f3,f4,f12,f13,f14,f21,f22,f23`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const secid = getSecId(symbol);
    
    const url = `${EF_BASE}/stock/get?secid=${secid}&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f55,f57,f58,f60,f169,f170,f171`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

app.get('/api/index', async (req, res) => {
  try {
    const secids = '1.000001,0.399001,0.399006';
    const url = `${EF_BASE}/ulist.np/get?pn=1&pz=3&po=1&np=1&fltt=2&invt=2&fid=f3&fs=f:1.1,f:2.1,f:3.1,f:4.1&secids=${secids}&fields=f1,f2,f3,f4,f12,f13,f14`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching index:', error);
    res.status(500).json({ error: 'Failed to fetch index' });
  }
});

// 搜索股票 - 实时获取全部A股
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json({ data: { diff: [] } });
    }

    // 获取沪深A股列表
    const url = `${EF_BASE}/ulist.np/get?pn=1&pz=5000&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f13,f14,f3`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && data.data.diff) {
      const qLower = q.toLowerCase();
      const filtered = data.data.diff.filter(item => 
        String(item.f12).includes(q) || 
        (item.f14 && item.f14.toLowerCase().includes(qLower))
      );
      return res.json({ data: { diff: filtered.slice(0, 20) } });
    }
    
    res.json({ data: { diff: [] } });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Stock API Proxy running on port ${PORT}`);
});
