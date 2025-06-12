# Framework Documentation & Resources

A curated collection of popular frameworks and libraries for machine learning, AI, and web development across Python, Java, and JavaScript ecosystems.

## 🐍 Python

### LangChain
**Build applications with LLMs through composability**

LangChain is a framework for developing applications powered by language models. It enables applications that are data-aware and agentic, allowing language models to connect with other sources of data and interact with their environment.

- **GitHub**: [langchain-ai/langchain](https://github.com/langchain-ai/langchain)
- **Documentation**: [python.langchain.com](https://python.langchain.com/)
- **Getting Started**: [Quick Start Guide](https://python.langchain.com/docs/get_started/quickstart)
- **Use Cases**: Chatbots, Q&A systems, summarization, code analysis

### PyTorch
**An open source machine learning framework**

PyTorch is a Python package that provides tensor computation with strong GPU acceleration and a tape-based autograd system for building deep neural networks.

- **GitHub**: [pytorch/pytorch](https://github.com/pytorch/pytorch)
- **Documentation**: [pytorch.org/docs](https://pytorch.org/docs/)
- **Tutorials**: [pytorch.org/tutorials](https://pytorch.org/tutorials/)
- **Use Cases**: Deep learning, computer vision, natural language processing, research

### Scikit-learn
**Machine learning in Python**

Simple and efficient tools for predictive data analysis. Built on NumPy, SciPy, and matplotlib, scikit-learn provides accessible machine learning algorithms for everyone.

- **GitHub**: [scikit-learn/scikit-learn](https://github.com/scikit-learn/scikit-learn)
- **Documentation**: [scikit-learn.org](https://scikit-learn.org/)
- **User Guide**: [scikit-learn.org/stable/user_guide.html](https://scikit-learn.org/stable/user_guide.html)
- **Use Cases**: Classification, regression, clustering, dimensionality reduction

## ☕ Java

### Spring AI
**AI integration framework for Spring applications**

Spring AI provides Spring-friendly APIs and abstractions for developing AI applications. It offers portable APIs across AI providers and supports various AI models including chat, text-to-image, and embedding models.

- **GitHub**: [spring-projects/spring-ai](https://github.com/spring-projects/spring-ai)
- **Documentation**: [docs.spring.io/spring-ai](https://docs.spring.io/spring-ai/reference/)
- **Getting Started**: [Spring AI Quick Start](https://docs.spring.io/spring-ai/reference/getting-started.html)
- **Use Cases**: Chat applications, RAG systems, function calling, vector databases

## 🟨 JavaScript

### TensorFlow.js
**Machine learning for JavaScript**

TensorFlow.js is a library for machine learning in JavaScript. Develop ML models in JavaScript and use ML directly in the browser, in Node.js, or in mobile apps.

- **GitHub**: [tensorflow/tfjs](https://github.com/tensorflow/tfjs)
- **Documentation**: [tensorflow.org/js](https://www.tensorflow.org/js)
- **Tutorials**: [tensorflow.org/js/tutorials](https://www.tensorflow.org/js/tutorials)
- **Use Cases**: Browser-based ML, real-time inference, transfer learning, model training

## 🚀 Quick Start Examples

### Python - LangChain Simple Chat
```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI()
response = llm.invoke([HumanMessage(content="Hello, world!")])
print(response.content)
```

### Java - Spring AI Chat
```java
@RestController
public class ChatController {
    private final ChatClient chatClient;
    
    @GetMapping("/chat")
    public String chat(@RequestParam String message) {
        return chatClient.prompt(message).call().content();
    }
}
```

### JavaScript - TensorFlow.js Model Loading
```javascript
import * as tf from '@tensorflow/tfjs';

// Load a pre-trained model
const model = await tf.loadLayersModel('/path/to/model.json');

// Make predictions
const prediction = model.predict(inputTensor);
```

## 📚 Additional Resources

- **Machine Learning Courses**: [Coursera ML Course](https://www.coursera.org/learn/machine-learning)
- **AI/ML Papers**: [Papers With Code](https://paperswithcode.com/)
- **Community**: [r/MachineLearning](https://www.reddit.com/r/MachineLearning/)
- **Conferences**: NeurIPS, ICML, ICLR, AAAI

## 🤝 Contributing

Feel free to contribute by:
- Adding new frameworks or libraries
- Updating documentation links
- Improving examples
- Fixing typos or errors

## 📄 License

This documentation is provided under the MIT License. Individual frameworks have their own licenses - please check their respective repositories.

---

**Last Updated**: June 2025  
**Maintainer**: [@mbzama](https://github.com/mbzama)