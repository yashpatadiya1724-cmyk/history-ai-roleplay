
import json

class RolePlayingEngine:
    def __init__(self, story_module_json):
        try:
            # If it's already a dict (though main.py sends string), or if it's a valid JSON string
            if isinstance(story_module_json, dict):
                self.story_module = story_module_json
            else:
                self.story_module = json.loads(story_module_json)
            
            # Ensure story_module has 'scenes'
            if "scenes" not in self.story_module or not self.story_module["scenes"]:
                raise ValueError("No scenes found")
                
        except Exception as e:
            # Robust fallback for non-JSON or malformed data
            print(f"RolePlayingEngine: Error parsing module data, using fallback. Error: {e}")
            self.story_module = {
                "title": "Historical Adventure",
                "scenes": [
                    {
                        "id": 1, 
                        "description": str(story_module_json)[:500] + "...", 
                        "choices": [
                            {"text": "Investigate further", "next_scene": 1},
                            {"text": "Wait for developments", "next_scene": 1}
                        ]
                    }
                ]
            }
        self.current_scene_id = 1
        self.player_role = None
        self.history = []

    def start_game(self, player_role):
        self.player_role = player_role
        return self.get_current_scene_data()

    def get_current_scene_data(self):
        scenes = self.story_module.get("scenes", [])
        if not scenes:
            return "The archives are silent. No story found."

        current_scene = next((s for s in scenes if s["id"] == self.current_scene_id), None)
        
        # If current scene ID not found, default to first scene
        if not current_scene:
            current_scene = scenes[0]
            self.current_scene_id = current_scene["id"]

        desc = current_scene.get("description", "A mysterious silence fills the air.")
        choices = [c["text"] for c in current_scene.get("choices", [])]
        
        if not choices:
            # Check if this is truly the end, or if we should loop back
            return f"{desc}\n\n(This chapter has concluded. Type anything to restart.)"
        
        choice_text = "\n".join([f"- {c}" for c in choices])
        return f"{desc}\n\nWhat will you do?\n{choice_text}"

    def make_decision(self, choice_text):
        # Find the choice object that matches the text
        current_scene = next((s for s in self.story_module.get("scenes", []) if s["id"] == self.current_scene_id), None)
        
        if current_scene:
            # 1. First try exact or substring matching for defined choices
            next_scene_id = None
            for c in current_scene.get("choices", []):
                if c["text"].lower() in choice_text.lower() or choice_text.lower() in c["text"].lower():
                    next_scene_id = c["next_scene"]
                    break
            
            # 2. If no choice matched, but we have choices, pick the first one as a fallback 
            # (To prevent "Scene not found" or "Unexpected end")
            if not next_scene_id and current_scene.get("choices"):
                next_scene_id = current_scene["choices"][0]["next_scene"]

            if next_scene_id:
                # Check if next_scene actually exists in the module
                exists = any(s["id"] == next_scene_id for s in self.story_module.get("scenes", []))
                if not exists:
                    # Loop back to scene 1 or stay in current if next doesn't exist
                    next_scene_id = 1 
                
                self.current_scene_id = next_scene_id
                self.history.append({"scene": current_scene["id"], "decision": choice_text})
                return self.get_current_scene_data()
            else:
                # 3. If it's truly an ending (no choices defined), loop back to start to keep it "Live"
                self.current_scene_id = 1
                return "The previous chapter ended. A new story begins...\n\n" + self.get_current_scene_data()

        # Final safety fallback
        self.current_scene_id = 1
        return "Timeline reset. Let's start again.\n\n" + self.get_current_scene_data()
