// config.js - Google Drive configuration
const storageConfig = {
  // Remove OneDrive configuration
  // oneDrive: {
  //   clientId: 'your-onedrive-client-id',
  //   redirectUri: 'your-redirect-uri',
  //   scopes: ['files.readwrite', 'offline_access']
  // },
  
  // New Google Drive configuration
  googleDrive: {
    apiKey: 'AIzaSyCBehZ8knTt5um09ym6Rs0Pv3K-JcPxWkU',
    clientId: '1070411208057-6s9img65ko7loqja8rta8nuf2hu3aitr.apps.googleusercontent.com',
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata'
    ],
    // Service account credentials (for server-side auth)
    serviceAccount: {
      clientEmail: 'biz-crm@biz-crm-454618.iam.gserviceaccount.com',
      privateKey: 'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8u5LfQMP/5m/9\nrFUCmLzbe12hCYOLVoflz6mPNJBs8Yd1608ajCbbJiWHH6RFCndGZ27YR8MVAVHA\nk8ZWYA7NGQ+w4e3bEnPBWE8JFcot0hp94fgGfzkV8l8kbh9LUbtZxwYA/ky0zled\nbCXfEv+lCzEdtNtbr1Z1CwZCvvg2B4VYc48HeTIHk5bZDxq3rPvAAG3UGIWdQcYb\n9yMANn/LAsGG7hEGIWmkOjpTELavCbt0tdoltVAjIPgEU6cx8iensMYl6hDbX3qt\n+2tNJ/Bk4EwSQQekBofx7mqLNRjV2lQVAoqy2VaunlTy+0dGCw6LhUnrETqocozn\nnxlvURBRAgMBAAECggEAB7NLxRr/cDtExBvuGUG1+WrHdX7F0KdkerF6CqUvdBl3\n8F1MJEI2AuSj3PczGKvKVWuakb2eUZbk4POKkOtBCVhZm/sA3VqLsWae7WkHn25a\nTTrtN6ck0y7ZF8t8MIKWfz2MArn9c1ZUq/At3KPZ3UAXVj3jAhL1pyd+rzYbWplq\nkVKloZFdxf3kpBdWp5Q5VlT9aWcM9+uOFapXjMOu+Vwo2gH0mkxy18yI3hx2mcDR\nuxnPK+kjnZr4/XZjUIHV7HgffUklkYtBT4aeOzBBAOW2+OCnlZ9SRpiIutvfBNsL\nb+wYqwV4XZywZeyPLcBGaPNTHC7m4Qz3ZKPhQkAOoQKBgQDxMa+1dueGii4s+cOd\nFbNMZUfrruZshJfLbH31Wbcay5qha57Q5m7300vKFS8l/OxZrYeLWfQLeWBT5I2A\nI7HLYuiDeVc7hJqxNaobV7JcRz8BQJL6o6oK9Pmeupf5JB0EYMHv7pTH6bZc2Bfx\n4qn15dQcjytUcnWHc2/PyUI5IQKBgQDIUXfOv+Tsk3Q6ehtUFwQQDq29BGD396x2\nRnqKOcsqwqK3IX9J9en+25mdoEBKZYsSBe8WiMF8seHB9YFHG7x5gv17ua7I/onH\nIJ2XeGz2LgpUlOKuUaidz4EhWA6IRfw1Ln1m8VLdEFTLIHaBIQ9/0f2kk8EtalGK\nTi4c0wsBMQKBgQDT2Ao2Xlt4hgGMq0suu5Kh9Qs4bIQiqEsS9xWi28vBkzcbtITn\ngp3QuhuFQRoKSZ3mHk5BDR8WvOLojIPkGnXc5+DFKVx/ADdGkpX4MgyMlF84YFk4\nH2wI96YPzmARCbEa2Uk9zdWLyTDNV1egsq8JNXYaJ32tTGMCN1frrx+lQQKBgQDE\nTUmp+tS8nVdWAtkLE67wiWHqjAL2nOiN0008bZxSIABSk+noMauIC+1C0YqPHWkm\nVVhR7dwmdS714r84Ts7pCNucxn6pCv87exPUHrgwmzeWYXyuNOmXFITHh0Jeeq7H\n8vIC0lRQvDNMB1j5+8rziHYWNJEnDzwu26RGrO3o0QKBgGjtAFA5vGN+qz9GfZLk\nSoRbrCbp9C2GO76+IdVt9rS76u1jfyJb/wurfwSNb7QUZpIpSONkqVCXuJ73AZUV\nDqPYuO1d/JOwMw+LdViETS9eXfV52kcbD9/Fq1wJRkzheBvdfZI/xBnfF+HacvEe\nvHzDNeNUip7pphA4ggi1Ctht',
      scopes: ['https://www.googleapis.com/auth/drive']
    }
  }
};

export default storageConfig;