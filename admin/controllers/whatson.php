<?php

    class Whatson_Controller extends LanWebsite_Controller {
        
        public function getInputFilters($action) {
            switch ($action) {
                case "addentry": return array("day" => "notnull", "start_time" => "notnull", "end_time" => "notnull", "title" => "notnull", "url" => "url", "colour" => "notnull");
                case "deleteentry": return array("entry_id" => array("notnull", "int"));
                case "addcommitteeentry": return array("day" => "notnull", "start_time" => "notnull", "end_time" => "notnull", "username_1" => "notnull", "username_2" => "notnull");
                case "deletecommitteeentry": return array("entry_id" => array("notnull", "int"));
            }
        }
        
        public function get_Index() {
            $tmpl = LanWebsite_Main::getTemplateManager();
            $tmpl->setSubtitle("What's On");
            $tmpl->addTemplate("whatson");
            $tmpl->output();
        }
        
        public function get_Getentries() {
            $arr = array("timetable" => array(), "committee" => array(), "users" => array());
            
            $res = LanWebsite_Main::getDb()->query("SELECT * FROM `timetable` ORDER BY day, start_time ASC");
            while ($row = $res->fetch_assoc()) $arr["timetable"][] = $row;
            
            $res = LanWebsite_Main::getDb()->query("SELECT * FROM `committee_timetable` ORDER BY day, start_time ASC");
            while ($row = $res->fetch_assoc()) {
                $arr["committee"][] = $row;
                
                if(!array_key_exists($row['user_id_1'], $arr["users"])) {
                    $user = LanWebsite_Main::getUserManager()->getUserById($row['user_id_1']);
                    $arr["users"][$row['user_id_1']] = array("id" => $row['user_id_1'], "username" => $user->getUsername());
                }
                if(!array_key_exists($row['user_id_2'], $arr["users"])) {
                    $user = LanWebsite_Main::getUserManager()->getUserById($row['user_id_2']);
                    $arr["users"][$row['user_id_2']] = array("id" => $row['user_id_2'], "username" => $user->getUsername());
                }
            }            
            echo json_encode($arr);
        }
        
        public function post_Addentry($inputs) {
            //Validation
            if (!in_array($inputs["day"], array("friday", "saturday", "sunday"))) $this->errorJSON("Invalid day");
            if (!preg_match('/^[0-2][0-9]:[0-5][0-9]$/', $inputs['start_time'])) $this->errorJSON("Invalid start time" . $inputs['start_time']);
            if (!preg_match('/^[0-2][0-9]:[0-5][0-9]$/', $inputs['end_time'])) $this->errorJSON("Invalid end time");
            if (str_replace(":", "", $inputs["start_time"]) >= str_replace(":", "", $inputs["end_time"])) $this->errorJSON("Start time cannot be greater than or the same as end time");
            if ($inputs["title"] == "") $this->errorJSON("Invalid title");
            if (!in_array($inputs["colour"], array("orange", "blue", "green", "purple"))) $this->errorJSON("Invalid colour");
            
            //Insert
            LanWebsite_Main::getDb()->query("INSERT INTO `timetable` (day, start_time, end_time, title, url, colour) VALUES ('%s', '%s', '%s', '%s', '%s', '%s')", $inputs["day"], $inputs["start_time"], $inputs["end_time"], $inputs["title"], $inputs["url"], $inputs["colour"]);
        }
        
        public function post_Deleteentry($inputs) {
        
            if (!LanWebsite_Main::getDb()->query("SELECT * FROM `timetable` WHERE timetable_id = '%s'", $inputs["entry_id"])->fetch_assoc()) $this->errorJSON("Invalid entry ID");
            LanWebsite_Main::getDb()->query("DELETE FROM `timetable` WHERE timetable_id = '%s'", $inputs["entry_id"]);
        
        }
        
        public function post_AddCommitteeentry($inputs) {
            //Validation
            if (!in_array($inputs["day"], array("friday", "saturday", "sunday"))) $this->errorJSON("Invalid day");
            if (!preg_match('/^[0-2][0-9]:[0-5][0-9]$/', $inputs['start_time'])) $this->errorJSON("Invalid start time" . $inputs['start_time']);
            //if (!preg_match('/^[0-2][0-9]:[0-5][0-9]$/', $inputs['end_time'])) $this->errorJSON("Invalid end time");
            //if (str_replace(":", "", $inputs["start_time"]) >= str_replace(":", "", $inputs["end_time"])) $this->errorJSON("Start time cannot be greater than or the same as end time");
            if ($this->isInvalid("username_1")) $this->errorJSON("Invalid User1");
            if ($this->isInvalid("username_2")) $this->errorJSON("Invalid User2");
            
            $user1 = LanWebsite_Main::getUserManager()->getUserByName($inputs["username_1"]);
            if(!$user1) $this->errorJSON("No user exists (1)");
            $user1ID = $user1->getUserId();
            
            $user2 = LanWebsite_Main::getUserManager()->getUserByName($inputs["username_2"]);
            if(!$user2) $this->errorJSON("No user exists (2)");
            $user2ID = $user2->getUserId();
            
            //Insert
            LanWebsite_Main::getDb()->query("INSERT INTO `committee_timetable` (day, start_time, user_id_1, user_id_2) VALUES ('%s', '%s', '%s', '%s')", $inputs["day"], $inputs["start_time"], $user1ID, $user2ID);
        }
        
        public function post_Deletecommitteeentry($inputs) {
            
            if (!LanWebsite_Main::getDb()->query("SELECT * FROM `committee_timetable` WHERE timetable_id = '%s'", $inputs["entry_id"])->fetch_assoc()) $this->errorJSON("Invalid entry ID");
            LanWebsite_Main::getDb()->query("DELETE FROM `committee_timetable` WHERE timetable_id = '%s'", $inputs["entry_id"]);
                        
        }
    }
    
?>
