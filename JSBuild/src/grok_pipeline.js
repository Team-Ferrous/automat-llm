import { createXai    } from '@ai-sdk/xai';
import { generateText } from 'ai';

//Certain models also support Structured Outputs, 
// which allows you to enforce a schema for the LLM output. 
// For an in-depth guide about using Grok for text responses, c
// heck out the xAI Text Generation Guide.

//User must provide key via UI to use Grok.
const xai = createXai({ apiKey: process.env.XAI_API_KEY });

async function get_grok_response(model, message){
        let text = await generateText({
            model: xai.responses(model),
            system: 'You are Grok, a highly intelligent, helpful AI assistant.',
            prompt: message,
        });
        return text
    }

async function get_grok_response_with_system_prompt(model, message){
    let text = await generateText({
            model: xai.responses(model),
            system: 'You are Grok, a highly intelligent, helpful AI assistant.',
            prompt: message,
        });
        return text
    } 

async function get_grok_image_response(model, message, image_link){
//Grok can accept both text and images as input. Pass an image URL alongside your prompt:
    const { text } = await generateText({
        model: xai.responses(model),
        messages: [{
            role: 'user',
            content: [
                    { type: 'image', image: image_link},
                    { type: 'text',  text:  message   },
                ],
            }],
        });
        return text;
    }

export {
    get_grok_response,
    get_grok_response_with_system_prompt,
    get_grok_image_response
}
