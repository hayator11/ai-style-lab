# データモデル設計

## 1. 基本方針

AIスタイルLabのデータモデルは、写真、質問回答、希望、傾向チェック結果、提案、フィードバックを段階的に扱えるように設計する。

MVPでは、DB実装やSupabase接続は行わず、将来の保存構造を明確にすることを目的とする。

MVPではImagesを中心データとして扱う。実画像保存はまだ行わないが、必要写真の種別、写真条件、揃っている写真、不足している写真を扱える構造にする。

診断結果は人を分類するためではなく、その人が前向きに行動しやすくなる提案の入口として扱う。そのため、保存するデータも「タイプを固定する」ものではなく、「現在の写真条件からの傾向」「根拠」「次に確認したいこと」を残せる構造にする。

## 2. Users

### 目的

ユーザー本人を識別し、診断履歴、画像、フィードバック、提案をひもづける。

MVPでは本番用認証を実装しないため、Usersは将来用の設計として扱う。

### 保存する主な情報

- ユーザーID
- 表示名
- メールアドレス
- プロフィール情報
- 利用開始日時
- 最終利用日時
- 同意情報
- 画像保存や診断履歴保存への同意状態

### 他テーブルとの関係

- 1人のUserは複数のDiagnosisを持つ
- 1人のUserは複数のImagesを持つ
- 1人のUserは複数のFeedbackを持つ
- 1人のUserは複数のRecommendationを持つ
- 1人のUserは複数のLearningDataを持つ

### MVPで必要な範囲

- 本番用Usersテーブルは実装しない
- ログインなしの仮セッション、またはローカル状態で診断体験を成立させる
- 将来Usersへ接続できるよう、診断データ側に任意のuserIdを持てる型を想定する

### 将来追加する範囲

- Supabase Authとの連携
- 診断履歴の保存
- プロフィール編集
- 画像保存の同意管理
- データ削除リクエスト
- アカウント削除

### 個人情報・画像データの注意点

- メールアドレスやプロフィールは個人情報として扱う
- 画像保存への同意状態をUsers側でも確認できるようにする
- アカウント削除時は、Diagnosis、Images、Feedback、Recommendation、LearningDataの扱いも決める

## 3. Diagnosis

### 目的

1回の診断セッションの写真チェック結果、補助質問、推定結果、根拠、追加確認事項を保存する。

診断結果は確定値ではなく、現在得られている写真と補助情報からの傾向として扱う。

### 保存する主な情報

- 診断ID
- userId
- 診断ステータス
- 診断カテゴリ
- 写真チェック結果
- 不足写真
- 写真条件
- 補助質問回答
- ユーザーの希望
- 使用した画像ID
- 候補スコア
- Confidence Score
- 診断根拠
- 追加写真の有無
- 追加質問の有無
- 追加で必要な情報
- 将来のAI解析結果
- 診断作成日時
- 診断更新日時

### 他テーブルとの関係

- DiagnosisはUserに属する
- Diagnosisは複数のImagesを参照する
- Diagnosisは複数のRecommendationを生む
- Diagnosisは複数のFeedbackを受け取る
- Diagnosisの結果はLearningDataの材料になる

### MVPで必要な範囲

- DB保存はしない
- 質問回答だけで仮の診断結果を生成しない
- 必要写真チェック、不足写真、写真条件、補助質問を扱う構造を想定する
- 複数候補、Confidence、根拠を将来持てる型設計につなげる

### 将来追加する範囲

- 診断履歴保存
- 写真解析結果との統合
- AI対話による再判定
- フィードバックを反映した再提案
- 診断バージョン管理

### 個人情報・画像データの注意点

- 診断結果はセンシティブに受け取られる可能性がある
- 断定表現を保存・表示しない
- 写真由来の根拠は、身体的特徴を否定的に書かない
- 診断履歴の公開範囲を明確にする

## 4. Images

### 目的

顔写真、全身写真、横向き写真、カラー確認用写真など、傾向チェックに使う画像のメタ情報を保存する。

画像そのものは将来的にSupabase Storageなどに保存し、Imagesには保存先と利用目的を記録する。

### 保存する主な情報

- 画像ID
- userId
- diagnosisId
- 画像種別
- Storage上のパス
- 必須写真かどうか
- アップロード済みかどうか
- 不足理由
- 画像品質メタ情報
- 撮影条件メモ
- 写真条件チェック結果
- AI解析済みかどうか
- 解析結果の要約
- 保存同意状態
- 作成日時
- 削除日時

### Phase2で追加する画像メタ情報

Phase2では、画像を「ラベル収集の起点」として扱うため、`ImageMeta` を用意する。

主なフィールド:

- imageId: 画像ID
- userId: 任意のユーザーID
- diagnosisId: 任意の診断ID
- photoType: `RequiredPhotoType`
- storagePath: 将来のStorage保存先
- shootingConditions: `PhotoCondition[]`
- qualityNote: 明るさ、ピント、顔や全身の見え方などの補足
- hasGroundTruth: スタイリスト等による確認済みラベルがあるか
- trainingConsent: `granted` / `denied` / `unknown`
- primaryLabelIds: 画像を代表する確定ラベルID
- createdAt: 作成日時

`trainingConsent` は画像保存同意とは分けて扱う。保存は許可されていても、学習利用は未確認または利用しない可能性があるため、明示的に状態を持たせる。

### 他テーブルとの関係

- ImageはUserに属する
- ImageはDiagnosisにひもづく
- Imageの解析結果はDiagnosisの根拠に使われる
- Imageに関するユーザー感想はFeedbackに残る場合がある

### MVPで必要な範囲

- Supabase Storage接続はしない
- 実画像保存はしない
- UI上ではアップロード枠、必要写真チェック、不足写真案内を扱う
- 写真種別、写真条件、不足状態を扱う
- ImagesをMVPの中心データとして扱う

想定する画像種別:

- 顔写真・正面
- 顔写真・笑顔
- 顔写真・真顔
- 顔写真・左右角度
- 全身写真・正面
- 全身写真・横向き
- 全身写真・自然な立ち姿
- カラー確認用・自然光
- カラー確認用・加工なし
- カラー確認用・白背景推奨

### 将来追加する範囲

- Supabase Storage連携
- 署名URL
- 画像削除機能
- 画像品質チェック
- AI Vision解析結果の保存
- 保存期間の管理

### 個人情報・画像データの注意点

- 顔写真と全身写真は特に慎重に扱う
- 公開URLで保存しない
- 署名URLやアクセス制御を使う
- 保存期間と削除方法を明示する
- ユーザーの同意なしにAI解析や再利用をしない

## 5. Label

### 目的

1枚の画像に対する、ある軸の見立てを保存する。

同じ画像に対して、スタイリスト、本人、AI、事後フィードバックのラベルを別々に持てるようにする。これにより、単一の結果に固定せず、複数の視点を後から比較できる。

### 保存する主な情報

- labelId
- imageId
- userId
- diagnosisId
- axis: `bone` / `face` / `color`
- typeKey: 独自名key
- standardEquivalent: 標準名
- source: `stylist` / `self` / `ai` / `feedback`
- labelerId
- confidence: 0.0-1.0
- isGroundTruth
- observedFeatures
- note
- createdAt
- updatedAt

### 他テーブルとの関係

- LabelはImageに属する
- LabelはUserやDiagnosisにひもづく場合がある
- Imageは代表ラベルを`primaryLabelIds`として参照できる
- AgreementLogは同一Image内のLabelを照合材料にする

### MVPで必要な範囲

- DB保存はしない
- `src/services/storage/labelStore.ts` でメモリ保持とブラウザlocalStorage保存を行う
- Labelを作成、取得、一覧、削除できる薄いCRUDにする
- 将来Supabaseへ差し替えられるよう、呼び出し側はストアのインターフェース越しに扱う

### 個人情報・画像データの注意点

- ラベルは画像にひもづくため、画像削除時の扱いを合わせて決める
- `source=stylist` かつ確認済みのものを `isGroundTruth=true` の基本形にする
- 本人やフィードバック由来のラベルは、納得感や調整の手がかりとして扱う
- 表示文言では断定を避け、傾向や見立てとして扱う

## 6. AgreementLog

### 目的

同一の `imageId` と `axis` について、AI推定、スタイリスト確認、本人申告、フィードバックの見立てを突き合わせる。

AgreementLogは、個別ユーザーへの断定ではなく、軸ごとの傾向確認や推定精度の検証に使う。

### 保存する主な情報

- imageId
- axis: `LabelAxis`
- aiTypeKey
- aiConfidence
- groundTruthTypeKey
- selfTypeKey
- agree
- note
- createdAt

### 他テーブルとの関係

- AgreementLogはImageとLabelから生成できる
- AI由来Labelとスタイリスト由来Labelの比較に使う
- 本人申告やフィードバック由来Labelがある場合は補助情報として使う

### MVPで必要な範囲

- 型定義のみ行う
- DB保存や集計UIは実装しない
- 後続フェーズでAI推定LabelとスタイリストLabelが揃った時に生成できる形にしておく

### 個人情報・画像データの注意点

- 集計時は個人が特定されない単位で扱う
- 精度検証の結果をユーザー個人への評価として扱わない
- `agree=false` は否定的な意味ではなく、見立ての差分として扱う

## 7. Feedback

### 目的

診断結果や提案を試した後の感想、周囲の反応、本人の納得感を保存する。

フィードバックは、診断結果を固定するためではなく、次回以降の提案をより本人に合う方向へ調整するために使う。

### 保存する主な情報

- フィードバックID
- userId
- diagnosisId
- recommendationId
- 試した内容
- 本人の感想
- 周囲の反応
- しっくりきた点
- もう少し調整したい点
- 評価スコア
- 作成日時

### 他テーブルとの関係

- FeedbackはUserに属する
- FeedbackはDiagnosisにひもづく
- FeedbackはRecommendationにひもづく
- FeedbackはLearningDataの材料になる

### MVPで必要な範囲

- DB保存はしない
- フィードバック入力UIも本格実装しない
- 将来の保存項目だけ定義しておく

### 将来追加する範囲

- 診断後アンケート
- 提案ごとの満足度
- 再提案のための補正
- 管理画面での集計
- 個人内の傾向学習

### 個人情報・画像データの注意点

- 自由記述には個人情報が含まれる可能性がある
- 周囲の反応を書く場合、第三者情報を過度に保存しない
- 学習利用する範囲を明示する
- 本人が削除できる設計にする

## 8. Recommendation

### 目的

傾向チェックや写真チェック結果をもとに、色、素材、服、帽子、髪型、姿勢、写真、SNSプロフィールなどの提案を保存する。

Recommendationは診断のゴールではなく、ユーザーが次に行動しやすくなるための具体的な提案として扱う。

MVPでは、本格診断後の提案だけでなく、写真が揃った後の次アクション提案にも使える構造にする。

### 保存する主な情報

- 提案ID
- userId
- diagnosisId
- 提案カテゴリ
- 提案タイトル
- 提案本文
- 提案理由
- 関連する候補タイプ
- Confidence Score
- 次アクション種別
- 試しやすさ
- 作成日時

### 他テーブルとの関係

- RecommendationはUserに属する
- RecommendationはDiagnosisから生成される
- RecommendationはFeedbackを受け取る
- Recommendationの結果はLearningDataに反映される

### MVPで必要な範囲

- DB保存はしない
- 写真が不足している場合の追加写真案内を提案として扱える構造を想定する
- 写真が揃った後の次アクションを提案できる構造を想定する
- 「傾向チェック」から「次の行動」へつなげる考え方を整理する

### 将来追加する範囲

- 場面別提案
- 帽子診断
- 姿勢診断
- 歩き方診断
- SNSプロフィール提案
- 写真の撮られ方提案
- 提案履歴

### 個人情報・画像データの注意点

- 提案は容姿を否定する表現にしない
- 体型や年齢に関する断定を避ける
- 画像由来の提案は根拠を慎重に扱う
- 第三者に共有される可能性を前提に、文言を安全にする

## 9. LearningData

### 目的

診断結果、提案、フィードバックをもとに、次回以降の提案精度を高めるための補正情報を保存する。

LearningDataは、全体モデルの学習というより、まずは個人内の好みや納得感を反映するためのデータとして扱う。

### 保存する主な情報

- 学習データID
- userId
- diagnosisId
- feedbackId
- recommendationId
- 反映対象カテゴリ
- 反映内容
- 重み
- 反映理由
- 作成日時
- 更新日時

### 他テーブルとの関係

- LearningDataはUserに属する
- LearningDataはDiagnosis、Feedback、Recommendationを材料にする
- LearningDataは次回のDiagnosisやRecommendationに補正として使われる

### MVPで必要な範囲

- 実装しない
- フィードバック学習は将来構想として設計だけ残す
- MVPでは診断結果に学習補正をかけない

### 将来追加する範囲

- 個人内の好み補正
- 提案カテゴリごとの重み
- 過去に好評だった提案の優先
- しっくりこなかった提案の抑制
- 管理画面での傾向確認

### 個人情報・画像データの注意点

- 学習利用の同意を明確にする
- 個人データを全体改善に使う場合は、別途同意を取る
- 削除依頼時にLearningDataも削除または匿名化する
- 「本人らしさ」を固定化しすぎないよう、更新可能なデータとして扱う

## 10. MVPで実装しないこと

MVPでは以下を実装しない。

- Supabase接続
- Supabase Storage接続
- DBマイグレーション
- 本番用認証
- OpenAI Vision解析
- フィードバック学習
- 管理画面からの編集
- 画像の永続保存
- AgreementLogの永続保存と集計UI

MVPでは、必要写真、写真条件、不足写真、補助質問、傾向チェック結果、根拠、次アクション提案の型を整理し、将来DBへ接続できる状態を目指す。

## 11. 次フェーズへの接続

このドキュメントは次の設計と実装へ接続する。

- `docs/result-design.md`: 写真チェック結果、Diagnosis、Recommendationをどう表示するか整理する
- `docs/vision-analysis.md`: Imagesに保存する画像種別、品質、解析項目を具体化する
- `src/lib/diagnosis`: PhotoRequirement、PhotoCheckResult、DiagnosisInput、DiagnosisResult、CandidateScore、Evidenceなどの型に反映する
- `src/data`: 必要写真データ、補助質問データ、選択肢、診断軸、スコアリング用メタ情報に反映する
- `src/services/storage/labelStore.ts`: Supabase接続時に同じ呼び出し方で差し替える

次に着手する場合は、DB実装ではなく `docs/result-design.md` を作成し、結果画面で扱う情報の粒度を先に固める。
