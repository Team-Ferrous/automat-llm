import decoder

decoder = decoder.Decoder()
results = decoder.decode_directory("path/to/input", mode="chat", include_metadata=True, output_dir="path/to/output")
print(results)