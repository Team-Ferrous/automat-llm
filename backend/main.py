# import os
# import logging
# import argparse

# import weaviate
# from dotenv import load_dotenv


# load_dotenv()  # <-- loads .env
# from   weaviate.classes.init import Auth
# import weaviate.classes as wvc
# #from   weaviate.classes.config import Configure

# #from dia import model as Dia
# #from playsound import playsound
# from automat_llm.core   import load_json_as_documents, load_personality_file, init_interactions, generate_response, create_rag_chain
# from automat_llm.config import load_config, save_config, update_config
# from rich.panel    import Panel
# from rich.markdown import Markdown
# from rich.console import Console
# from weaviate.auth import AuthApiKey

# console     = Console()
# config      = load_config()
# current_dir = os.getcwd()

# def render_llm(text: str, title: str = "LLM Response"):
#     md = Markdown(text, code_theme="monokai", hyperlinks=True)
#     panel = Panel(
#         md,
#         title=title,
#         border_style="cyan",
#         padding=(1, 2)
#     )
#     console.print(panel)

# weaviate_url = os.environ.get("WEAVIATE_URL")
# weaviate_api_key = os.environ.get("WEAVIATE_API_KEY")

# user_id          = "Automat-User-Id" # config["default_user"]  # , In the future this will be in a config the user can set.
#                                      # It is made for a single-user system; can be modified for multi-user

# if not weaviate_url:
#     raise ValueError("WEAVIATE_URL is missing from your .env file!")



# print("WEAVIATE_URL:", weaviate_url)
# print("WEAVIATE_API_KEY loaded?", bool(weaviate_api_key))

# # client = weaviate.connect_to_weaviate_cloud(
# #     cluster_url=weaviate_url,
# #     auth_credentials=AuthApiKey(weaviate_api_key),
# # )
# client = weaviate.connect_to_weaviate_cloud(
#     cluster_url="https://ailkhgxqbyydadl8d0gsg.c0.us-east1.gcp.weaviate.cloud",
#     auth_credentials=Auth.api_key("akEybFdCTzI1YzQ4RGFIbF9rSVhscktMZlRsN1Nad0o5bmg2VXpUOWY5Q29TRzZKMUFMMHc3MlJtTXBvPV92MjAw"),
# )
# client = weaviate.connect_to_weaviate_cloud(
#     cluster_url="https://ailkhgxqbyydadl8d0gsg.c0.us-east1.gcp.weaviate.cloud",
#     auth_credentials=weaviate.auth.AuthApiKey("akEybFdCTzI1YzQ4RGFIbF9rSVhscktMZlRsN1Nad0o5bmg2VXpUOWY5Q29TRzZKMUFMMHc3MlJtTXBvPV92MjAw"),
    
# )



# # Create a simple greeting object
# try:
#     # Check if collection exists
#     if not client.collections.exists("SampleData"):
#         client.collections.create(
#             name="SampleData",
#             vectorizer_config=wvc.config.Configure.Vectorizer.text2vec_transformers(),
#             properties=[
#                 wvc.config.Property(name="content", data_type=wvc.config.DataType.TEXT),
#                 wvc.config.Property(name="category", data_type=wvc.config.DataType.TEXT),
#             ]
#         )
#         print("Created 'SampleData' collection.")

#     # Add sample data
#     sample_collection = client.collections.get("SampleData")
#     data_to_add = [
#         {
#             "content": "hi",
#             "category": "Greeting",
#             "response": "Hello! I am your AI assistant. How can I help you today?"
#         }
#     ]

#     with sample_collection.batch.dynamic() as batch:
#         for item in data_to_add:
#             batch.add_object(properties=item)

#     print("Successfully added greeting data!")

# finally:
#     client.close()

# # Ensure directories exist
# directory = os.path.abspath(f'{current_dir}/Input_JSON/')
# if not os.path.exists(directory):
#     print(f"Cleaned JSON directory not found at {directory}. Creating Input_JSON folder")
#     os.mkdir(f'{current_dir}/Input_JSON')
#     print("UnhandledException: please load Cleaned_, or Cybel Memory JSON into Input_JSON")
#     exit()

# # Set up logging to save chatbot interactions
# logging.basicConfig(
#     filename=f'{current_dir}/Logs/chatbot_logs.txt', #r'./Logs/chatbot_logs.txt',
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(message)s'
# )

#   # Load personality, interactions, documents, rag_chain at startup
# personality_data  = load_personality_file()
# user_interactions = init_interactions()
# rude_keywords     = ["stupid", "idiot", "shut up", "useless", "dumb"]
# documents         = load_json_as_documents(client, directory)
# rag_chain         = create_rag_chain(client, user_id, documents)

# def chat_once(user_input: str):
#     try:
#         response = generate_response(user_id, user_interactions, user_input, rude_keywords, personality_data, rag_chain)
#         return response
#     except Exception as e:
#         return f"Error generating response: {e}"
        


# # Chatbot loop
# if __name__ == "__main__":
#     parser = argparse.ArgumentParser(description="Demo of boolean flag with argparse.")
#     parser.add_argument("--set", metavar="KEY=VALUE", help="Set a configuration value (e.g., user.name=Alice)")
#     parser.add_argument("--use_dia",          action="store_true",  help="Enable Dia audio model use and output") # Boolean flag
#     parser.add_argument("--local_connection", action="store_true", help="Use Weaviate locally via docker-compose.") # Boolean flag
#     args = parser.parse_args()

#     #if args.use_dia:
#     #    dia_model = Dia.from_pretrained("nari-labs/Dia-1.6B", compute_dtype="float16")
#     #    print("Audio mode is ON")
#     #else:
#     #    print("Audio mode is OFF")

#     if args.local_connection == True:
#         client = weaviate.connect_to_local(additional_config=wvc.init.AdditionalConfig(timeout=wvc.init.Timeout(init=60,query=30, insert=120)))
#     else:
#         client = weaviate.connect_to_weaviate_cloud(
#         cluster_url=weaviate_url,                                    # Replace with your Weaviate Cloud URL
#        auth_credentials=Auth.api_key(weaviate_api_key),              # Replace with your Weaviate Cloud key
#     )

#     personality_data  = load_personality_file()
#     user_interactions = init_interactions()
#     documents         = load_json_as_documents(client, directory)

#     if not documents:
#         print("No documents extracted from JSON files. Please check the file contents.")
#         exit()

#     print(f"Loaded {len(documents)} documents for RAG.")

#     # Extract personality details
#     char_name     = personality_data['char_name']

#     # Rudeness detection keywords
#     rude_keywords = ["stupid", "idiot", "shut up", "useless", "dumb"]
#     rag_chain     = create_rag_chain(client, user_id, documents)

#     if args.set:
#         if "=" not in args.set:
#             parser.error("Argument to --set must be in key=value format.")
#         key, value = args.set.split("=", 1)

#         # Type inference (primitive)
#         if value.lower() in ("true", "false"):
#             value = value.lower() == "true"
#         elif value.isdigit():
#             value = int(value)

#         config = update_config(config, key, value)
#         save_config(config)
#         print(f"Updated {key} to {value}")

#     print(f"Current config:\n{config}")
#     print(f"\n{char_name} is ready! Type your message (or 'quit' to exit).")
#     # while True:
#     #     try:
#     #         user_input = input("You: ")
#     #         if user_input.lower() == 'quit':
#     #             print("Goodbye!")
#     #             break
#     #         response = generate_response(user_id, user_interactions, user_input, rude_keywords, personality_data, rag_chain)
#     #         #if(args.use_dia):
#     #             #output = dia_model.generate(f"[S1] {response}", use_torch_compile=True, verbose=True)
#     #             #dia_model.save_audio(f"response.mp3", output)
#     #             #playsound("response.mp3")
#     #         #print(f"{char_name}: {response}")
#     #         render_llm(response, title=f"{char_name}")
#     #     except Exception as e:
#     #         print(f"Error in chatbot loop: {e}")
    
# 

import os
import logging
from dotenv import load_dotenv

# 1. LOAD DOTENV FIRST
load_dotenv()

import weaviate
from weaviate.classes.init import Auth
from automat_llm.core import (
    load_json_as_documents, 
    load_personality_file, 
    init_interactions, 
    generate_response, 
    create_rag_chain
)

# Globals
client = None
rag_chain = None
personality_data = None
user_interactions = None
documents = None
rude_keywords = ["stupid", "idiot", "shut up", "useless", "dumb"]
user_id = "Automat-User-Id"

def initialize_system():
    global client, rag_chain, personality_data, user_interactions, documents
    
    url = os.environ.get("WEAVIATE_URL")
    key = os.environ.get("WEAVIATE_API_KEY")

    if not url or not key:
        raise ValueError("Check your .env! WEAVIATE_URL or WEAVIATE_API_KEY is missing.")

    # 2. Connect
    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=url,
        auth_credentials=Auth.api_key(key)
    )

    # 3. Ready Check (Crucial)
    if not client.is_ready():
        raise ConnectionError("Weaviate is not ready. Check your cluster status in WCD.")

    # 4. Data Setup
    directory = os.path.abspath(os.path.join(os.getcwd(), 'Input_JSON'))
    if not os.path.exists(directory):
        os.makedirs(directory)

    personality_data = load_personality_file()
    user_interactions = init_interactions()
    documents = load_json_as_documents(client, directory)
    
    # Build Chain
    rag_chain = create_rag_chain(client, user_id, documents)
    print("--- System Ready ---")

def chat_once(user_input: str):
    try:
        # If this fails, it usually means the LLM API Key is missing
        return generate_response(user_id, user_interactions, user_input, rude_keywords, personality_data, rag_chain)
    except Exception as e:
        # This will now show you the ACTUAL error in your console
        print(f"CRITICAL ERROR: {e}")
        return f"System Error: {str(e)}"