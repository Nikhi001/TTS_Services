"""
Standalone CPU inference test for OmniVoice.
Validates that the real OmniVoice model loads on CPU and synthesizes speech to a valid WAV file.
Follows Phase 2 Exit Criteria from the project roadmap.
"""
import time
import os
import sys

def main():
    print("=" * 60)
    print("OmniVoice Standalone CPU Inference Test")
    print("=" * 60)

    try:
        import torch
        import soundfile as sf
        from omnivoice import OmniVoice
    except ImportError as e:
        print(f"ImportError: {e}")
        print("Please ensure torch, soundfile, and omnivoice are installed.")
        sys.exit(1)

    device = "cpu"
    dtype = torch.float32
    print(f"PyTorch version: {torch.__version__}")
    print(f"Device: {device}, Dtype: {dtype}")

    print("\n[1/3] Loading OmniVoice model from pretrained 'k2-fsa/OmniVoice'...")
    start_load = time.time()
    model = OmniVoice.from_pretrained(
        "k2-fsa/OmniVoice",
        device_map=device,
        dtype=dtype
    )
    load_time = time.time() - start_load
    print(f"Model loaded successfully in {load_time:.2f} seconds.")

    test_text = "OmniVoice text to speech is running on CPU."
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "outputs"))
    os.makedirs(output_dir, exist_ok=True)
    output_wav = os.path.join(output_dir, "standalone_test_output.wav")

    print(f"\n[2/3] Generating speech for text: '{test_text}' (num_step=16 for CPU validation)...")
    start_infer = time.time()
    # Using 16 diffusion steps for fast CPU validation as documented in OmniVoice README
    audio = model.generate(text=test_text, num_step=16)
    infer_time = time.time() - start_infer
    print(f"Inference completed in {infer_time:.2f} seconds.")

    print(f"\n[3/3] Saving generated audio to: {output_wav}...")
    sample_rate = 24000
    sf.write(output_wav, audio[0], sample_rate)

    if os.path.exists(output_wav):
        file_size = os.path.getsize(output_wav)
        duration = len(audio[0]) / sample_rate
        print(f"\nSUCCESS: WAV file created successfully!")
        print(f"  Path: {output_wav}")
        print(f"  File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
        print(f"  Duration: {duration:.2f} seconds")
        print(f"  Sample rate: {sample_rate} Hz")
        assert file_size > 1000, "WAV file too small!"
        assert duration > 0.5, "Audio duration too short!"
        print("\nAll standalone CPU inference checks PASSED!")
    else:
        raise RuntimeError(f"Generated WAV file was not found at {output_wav}!")

if __name__ == "__main__":
    main()
