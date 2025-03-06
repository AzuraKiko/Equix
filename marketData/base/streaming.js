const axios = require('axios');
const eventsourceParser = require('eventsource-parser');

// Hàm xử lý response từ stream
async function streamLatestResponse(url, token) {
  const responses = [];

  try {
    // Gửi request với response dạng stream
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'stream',
    });

    // Khởi tạo parser của eventsource-parser
    const parser = eventsourceParser.createParser((event) => {
      if (event.type === 'event') {
        console.log('Dữ liệu sự kiện:', event.data);
        try {
          // Chuyển đổi dữ liệu từ chuỗi JSON sang object
          const jsonData = JSON.parse(event.data);
          responses.push(jsonData);
        } catch (err) {
          console.error('Lỗi khi phân tích JSON:', err.message);
        }
      }
    });

    // Đọc dữ liệu từ stream và đưa vào parser
    response.data.on('data', (chunk) => {
      const text = chunk.toString();
      console.log(text);
      parser.feed(text); // Sử dụng parser.feed để xử lý chuỗi
    });

    // Xử lý khi kết thúc stream
    response.data.on('end', () => {
      console.log('Kết thúc stream.');
    });

    // Xử lý lỗi trong quá trình stream
    response.data.on('error', (err) => {
      console.error('Lỗi trong quá trình stream:', err.message);
    });

  } catch (error) {
    console.error('Lỗi khi gửi request:', error.message);
    if (error.response) {
      console.error('Chi tiết lỗi:', error.response.status, error.response.statusText);
    }
  }

  return {
    getLatestQuoteOrDepth: (type) => {
      // Lọc response theo loại (quote hoặc depth)
      const filtered = responses.filter((res) => res[type]);
      return filtered.length ? filtered[filtered.length - 1][type] : null;
    },
  };
}

module.exports = { streamLatestResponse };

(async () => {
    const url = "https://dev2-market-feed.equix.app/v1/price/ANZ.ASX_ORIGIN";
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodXllbi50cmFuYXN4QGVxdWl4LmNvbS5hdSIsInN1YiI6ImVxMTc0MDIwNjQ1NTAyNyIsImV4cCI6MTc0MDU2NjIyMy4yNDgsImRldmljZV9pZCI6ImM4ZjIyM2Q5LWI1ZjMtNDg1ZS1hNzE1LTA0ODk0ZTI5NzY2OSIsImlhdCI6MTc0MDU2NTAyM30.m_-GZkhJQDkwnkIYWxtIPnoK4VaTWQa4WZos_rMXBFYhGzD53YV1HGlUb_AL9c8DBNjM1G1ChUDTp1gfP3RdP_uPFTFz8lpGEEz_pol1MexYSauOjH_eWeLnAt3kr9lLrTpBZ0q-KdW4dcPKJ84lUDXt1OTyCP4H5B7Iw57CiGH6yeGm6Uaka4zHxfWdXbXOVmYHy7N4RFzJTlx0vv40v0q3kznHfdkL071f92LvQ_4WMue9_dpjvsLQZSPLXtFCrAhtrxNcm-LRQ0gG6AEi8sidgCCwFRza8up2U_ZryOFZv9dYro_UsIxBFiiogGlwYGm5dBicDihL8L2HTluhd8DTIn1x6xJPjWGHNdafBATEl6F03vyRbzrSfLKHfSxr-K84utlcza-E6m5UPaGn1Pw_b9F7Gw4sa__lrgFIBDAWc1uqpFu6Cw4WkEMAZqhXl1HiDiP5X0ZeEVlHKFvO7NfhwzaSyjlp_ZyIip9b2lNnn662rLFLSGYhU7km2cqiz15eJqwCqsjfv456oF8znmo6NBpruf1GlSjM5nXWxqSflf0HKQvP1FMBZ_Ln9ngKieFic_OYD7Yy1tt4mWqJLiKyVBlZ-Y0o7FiGWSiMtlBT95LFUddHuINp4-i1Cxb4nK8nPJgJyOdTXtR0PhbMrPbIjrI7InjF0tcRqKG0eww';
    
    const streamHandler = await streamLatestResponse(url, token);
  
    // Lấy dữ liệu mới nhất cho quote
    const latestQuote = streamHandler.getLatestQuoteOrDepth('quote');
    console.log('Quote mới nhất:', latestQuote);
    const latestType = streamHandler.getLatestQuoteOrDepth('type');
    console.log('Type mới nhất:', latestType);
  
    // Lấy dữ liệu mới nhất cho depth
    const latestDepth = streamHandler.getLatestQuoteOrDepth('depth');
    console.log('Depth mới nhất:', latestDepth);
  })();